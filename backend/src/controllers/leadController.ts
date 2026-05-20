import { Response, NextFunction } from 'express';
import { FilterQuery } from 'mongoose';
import { Lead, ILeadDocument } from '../models/Lead';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest, LeadFilterQuery, LeadStatus, LeadSource } from '../types';
import { Parser } from 'json2csv';

export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      source,
      search,
      sort = 'latest',
    } = req.query as LeadFilterQuery;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: FilterQuery<ILeadDocument> = {};

    // Sales users can only see their own leads
    if (req.user?.role === 'sales_user') {
      filter.createdBy = req.user.id;
    }

    if (status) filter.status = status as LeadStatus;
    if (source) filter.source = source as LeadSource;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, totalDocs] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum);

    sendSuccess(res, 200, 'Leads fetched successfully', leads, {
      totalDocs,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!lead) {
      sendError(res, 404, 'Lead not found');
      return;
    }

    // Sales users can only view their own leads
    if (
      req.user?.role === 'sales_user' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      sendError(res, 403, 'Access denied');
      return;
    }

    sendSuccess(res, 200, 'Lead fetched', lead);
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user?.id,
    });

    sendSuccess(res, 201, 'Lead created successfully', lead);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      sendError(res, 404, 'Lead not found');
      return;
    }

    // Sales users can only update their own leads
    if (
      req.user?.role === 'sales_user' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      sendError(res, 403, 'Access denied');
      return;
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    sendSuccess(res, 200, 'Lead updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      sendError(res, 404, 'Lead not found');
      return;
    }

    // Only admins or the creator can delete
    if (
      req.user?.role === 'sales_user' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      sendError(res, 403, 'Access denied');
      return;
    }

    await Lead.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: FilterQuery<ILeadDocument> = {};

    if (req.user?.role === 'sales_user') {
      filter.createdBy = req.user.id;
    }

    const leads = await Lead.find(filter)
      .populate('createdBy', 'name email')
      .lean();

    const fields = ['name', 'email', 'status', 'source', 'notes', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(
      leads.map((l) => ({
        name: l.name,
        email: l.email,
        status: l.status,
        source: l.source,
        notes: l.notes ?? '',
        createdAt: l.createdAt,
      }))
    );

    res.header('Content-Type', 'text/csv');
    res.attachment('leads.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matchStage =
      req.user?.role === 'sales_user'
        ? { $match: { createdBy: req.user.id } }
        : { $match: {} };

    const [statusStats, sourceStats, total] = await Promise.all([
      Lead.aggregate([matchStage, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([matchStage, { $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.countDocuments(req.user?.role === 'sales_user' ? { createdBy: req.user.id } : {}),
    ]);

    sendSuccess(res, 200, 'Stats fetched', { total, statusStats, sourceStats });
  } catch (error) {
    next(error);
  }
};
