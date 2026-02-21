import React from 'react';
import { Button, Separator } from "@/components/ui";
import { useNavigate, useParams } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui";
import { CircleDot, Bug, Zap, BookOpen, CheckCircle2, Clock, Eye,
  AlertTriangle, Calendar, User, Tag, Layers,
  Hash, ExternalLink, CheckSquare, Square, FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { MessageAttachment, documents, tasks as allTasks, users } from '../data/mockData';

// ─── Status & Priority configs ───
const TASK_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'backlog': { label: 'Backlog', color: 'text-[#858585]', bg: 'bg-[#858585]/10 border-[#858585]/20', icon: <Clock size={14} /> },
  'todo': { label: 'To Do', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <CircleDot size={14} /> },
  'in-progress': { label: 'In Progress', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: <Zap size={14} /> },
  'in-review': { label: 'In Review', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: <Eye size={14} /> },
  'done': { label: 'Done', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 size={14} /> },
};

const TASK_PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'critical': { label: 'Critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  'high': { label: 'High', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  'medium': { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'low': { label: 'Low', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

function getTaskTypeInfo(type?: string): { icon: React.ReactNode; label: string } {
  switch (type) {
    case 'bug': return { icon: <Bug size={14} className="text-red-500" />, label: 'Bug' };
    case 'story': return { icon: <BookOpen size={14} className="text-[#5b5fc7]" />, label: 'Story' };
    case 'spike': return { icon: <Zap size={14} className="text-amber-500" />, label: 'Spike' };
    default: return { icon: <CircleDot size={14} className="text-[#5b5fc7]" />, label: 'Task' };
  }
}

// ─── Task Detail Dialog ───
interface TaskDetailDialogProps {
  attachment: MessageAttachment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ attachment, open, onOpenChange }: TaskDetailDialogProps) {
  const navigate = useNavigate();
  const { spaceId } = useParams();

  // Try to find full task data from mock
  const fullTask = allTasks.find(t =>
    t.title === attachment.name ||
    t.id === attachment.taskId
  );

  const statusCfg = TASK_STATUS_CONFIG[attachment.taskStatus || 'todo'];
  const prioCfg = TASK_PRIORITY_CONFIG[attachment.taskPriority || 'medium'];
  const typeInfo = getTaskTypeInfo(attachment.taskType);

  const handleGoToTasks = () => {
    onOpenChange(false);
    const targetSpace = spaceId || 'engineering';
    navigate(`/space/${targetSpace}/tasks`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-[#1e1f22] border-[#e1dfdd] dark:border-[#3d3d3d]">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-[#5b5fc7]/10 via-[#5b5fc7]/5 to-transparent dark:from-[#5b5fc7]/20 dark:via-[#5b5fc7]/10 px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                {typeInfo.icon}
                <span className="text-[11px] font-semibold text-[#616161] dark:text-[#949ba4] uppercase tracking-wide">
                  {typeInfo.label}
                </span>
              </div>
              {attachment.taskId && (
                <span className="text-[12px] font-mono font-semibold text-[#5b5fc7] dark:text-[#a6a9dc] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 px-2 py-0.5 rounded">
                  {attachment.taskId}
                </span>
              )}
            </div>
            <DialogTitle className="text-[#242424] dark:text-[#f2f3f5] text-[17px]">
              {attachment.name}
            </DialogTitle>
            {fullTask?.description && (
              <DialogDescription className="text-[13px] text-[#616161] dark:text-[#949ba4] mt-1">
                {fullTask.description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Properties grid */}
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <DetailRow
              icon={statusCfg.icon}
              label="Status"
              value={
                <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-semibold border', statusCfg.bg, statusCfg.color)}>
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              }
            />
            {/* Priority */}
            <DetailRow
              icon={<AlertTriangle size={14} className="text-[#616161] dark:text-[#949ba4]" />}
              label="Priority"
              value={
                <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-semibold border', prioCfg.bg, prioCfg.color)}>
                  {attachment.taskPriority === 'critical' && <AlertTriangle size={11} />}
                  {prioCfg.label}
                </span>
              }
            />
            {/* Assignee */}
            <DetailRow
              icon={<User size={14} className="text-[#616161] dark:text-[#949ba4]" />}
              label="Assignee"
              value={
                <div className="flex items-center gap-2">
                  {(() => {
                    const assigneeUser = users.find(u => u.name === attachment.taskAssignee);
                    return assigneeUser ? (
                      <>
                        <img src={assigneeUser.avatar} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-[13px] text-[#242424] dark:text-[#f2f3f5]">{attachment.taskAssignee}</span>
                      </>
                    ) : (
                      <span className="text-[13px] text-[#242424] dark:text-[#f2f3f5]">{attachment.taskAssignee || 'Unassigned'}</span>
                    );
                  })()}
                </div>
              }
            />
            {/* Type */}
            <DetailRow
              icon={<Layers size={14} className="text-[#616161] dark:text-[#949ba4]" />}
              label="Type"
              value={
                <div className="flex items-center gap-1.5">
                  {typeInfo.icon}
                  <span className="text-[13px] text-[#242424] dark:text-[#f2f3f5]">{typeInfo.label}</span>
                </div>
              }
            />
          </div>

          {/* Extended details from full task */}
          {fullTask && (
            <>
              <Separator className="bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
              <div className="grid grid-cols-2 gap-3">
                {fullTask.storyPoints !== undefined && (
                  <DetailRow
                    icon={<Hash size={14} className="text-[#616161] dark:text-[#949ba4]" />}
                    label="Story Points"
                    value={<span className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{fullTask.storyPoints}</span>}
                  />
                )}
                {fullTask.epic && (
                  <DetailRow
                    icon={<Layers size={14} className="text-[#616161] dark:text-[#949ba4]" />}
                    label="Epic"
                    value={
                      <span className={cn('text-[12px] font-semibold px-2 py-0.5 rounded-md border', {
                        'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20': fullTask.epicColor === 'purple',
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20': fullTask.epicColor === 'blue',
                        'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20': fullTask.epicColor === 'green',
                        'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20': fullTask.epicColor === 'orange',
                        'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20': fullTask.epicColor === 'red',
                      })}>
                        {fullTask.epic}
                      </span>
                    }
                  />
                )}
                {fullTask.sprint && (
                  <DetailRow
                    icon={<Zap size={14} className="text-[#616161] dark:text-[#949ba4]" />}
                    label="Sprint"
                    value={<span className="text-[13px] text-[#242424] dark:text-[#f2f3f5]">{fullTask.sprint}</span>}
                  />
                )}
                {fullTask.dueDate && (
                  <DetailRow
                    icon={<Calendar size={14} className="text-[#616161] dark:text-[#949ba4]" />}
                    label="Due Date"
                    value={<span className="text-[13px] text-[#242424] dark:text-[#f2f3f5]">{format(fullTask.dueDate, 'MMM d, yyyy')}</span>}
                  />
                )}
              </div>

              {/* Labels */}
              {fullTask.labels && fullTask.labels.length > 0 && (
                <div className="mt-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Tag size={13} className="text-[#616161] dark:text-[#949ba4]" />
                    <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wide font-semibold">Labels</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fullTask.labels.map(label => (
                      <span
                        key={label}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#f0f0f5] dark:bg-[#2b2d31] text-[#616161] dark:text-[#b9bbbe] border border-[#e1dfdd] dark:border-[#3d3d3d]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {fullTask.subtasks && fullTask.subtasks.length > 0 && (
                <div className="mt-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckSquare size={13} className="text-[#616161] dark:text-[#949ba4]" />
                    <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wide font-semibold">
                      Subtasks ({fullTask.subtasks.filter(s => s.done).length}/{fullTask.subtasks.length})
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#e1dfdd] dark:bg-[#3d3d3d] overflow-hidden ml-1">
                      <div
                        className="h-full rounded-full bg-[#5b5fc7] transition-all"
                        style={{ width: `${(fullTask.subtasks.filter(s => s.done).length / fullTask.subtasks.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {fullTask.subtasks.map(st => (
                      <div key={st.id} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-[#f5f5f5] dark:hover:bg-[#2b2d31] transition-colors">
                        {st.done ? (
                          <CheckSquare size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc] shrink-0" />
                        ) : (
                          <Square size={14} className="text-[#8a8a8a] dark:text-[#6d6f78] shrink-0" />
                        )}
                        <span className={cn(
                          'text-[13px]',
                          st.done
                            ? 'line-through text-[#8a8a8a] dark:text-[#6d6f78]'
                            : 'text-[#242424] dark:text-[#f2f3f5]',
                        )}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1a1b1e] flex items-center justify-between">
          <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">
            {fullTask?.createdAt ? `Created ${format(fullTask.createdAt, 'MMM d, yyyy')}` : 'Task attachment'}
          </span>
          <Button
            onClick={handleGoToTasks}
            className="h-8 bg-[#5b5fc7] hover:bg-[#4f52b5] text-white text-[13px] gap-1.5"
            size="sm"
          >
            Open in Tasks <ExternalLink size={13} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Document Detail Dialog ───
interface DocumentDetailDialogProps {
  attachment: MessageAttachment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentDetailDialog({ attachment, open, onOpenChange }: DocumentDetailDialogProps) {
  const navigate = useNavigate();
  const { spaceId } = useParams();

  const fullDoc = documents.find(d => d.id === attachment.docId);

  const handleGoToDocuments = () => {
    onOpenChange(false);
    const targetSpace = spaceId || 'engineering';
    navigate(`/space/${targetSpace}/documents`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-[#1e1f22] border-[#e1dfdd] dark:border-[#3d3d3d]">
        {/* Header with emoji */}
        <div className="bg-gradient-to-r from-[#5b5fc7]/10 via-[#5b5fc7]/5 to-transparent dark:from-[#5b5fc7]/20 dark:via-[#5b5fc7]/10 px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{attachment.docEmoji || fullDoc?.emoji || '📄'}</span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-[#242424] dark:text-[#f2f3f5] text-[17px]">
                  {fullDoc?.title || attachment.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {(attachment.docType || fullDoc?.type) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc] border border-[#5b5fc7]/20">
                      {(() => {
                        const t = attachment.docType || fullDoc?.type;
                        return t === 'doc' ? 'Document' : t === 'sheet' ? 'Spreadsheet' : 'Presentation';
                      })()}
                    </span>
                  )}
                  {(attachment.docAuthor || fullDoc?.author) && (
                    <span className="text-[12px] text-[#616161] dark:text-[#949ba4]">
                      by {attachment.docAuthor || fullDoc?.author}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogDescription className="sr-only">Document preview</DialogDescription>
          </DialogHeader>
        </div>

        {/* Document properties */}
        <div className="px-6 py-3 flex items-center gap-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1a1b1e]">
          {fullDoc?.createdAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#616161] dark:text-[#949ba4]">
              <Calendar size={12} />
              Created {format(fullDoc.createdAt, 'MMM d, yyyy')}
            </div>
          )}
          {(attachment.docLastModified || fullDoc?.lastModified) && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#616161] dark:text-[#949ba4]">
              <Clock size={12} />
              Modified {format(attachment.docLastModified || fullDoc!.lastModified, 'MMM d, yyyy')}
            </div>
          )}
          {fullDoc?.favorite && (
            <span className="text-[11px] text-amber-500">&#9733; Favorite</span>
          )}
        </div>

        {/* Content preview */}
        <div className="px-6 py-4 max-h-[320px] overflow-y-auto scrollbar-on-hover">
          {fullDoc?.content && fullDoc.content.length > 0 ? (
            <div className="space-y-2">
              {fullDoc.content.slice(0, 10).map(block => (
                <DocumentBlockPreview key={block.id} block={block} />
              ))}
              {fullDoc.content.length > 10 && (
                <p className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] italic mt-2">
                  ... and {fullDoc.content.length - 10} more blocks
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto text-[#8a8a8a] dark:text-[#6d6f78] mb-2" />
              <p className="text-[13px] text-[#616161] dark:text-[#949ba4]">Document preview not available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1a1b1e] flex items-center justify-between">
          <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">
            {fullDoc ? `${fullDoc.content?.length || 0} content blocks` : 'Document attachment'}
          </span>
          <Button
            onClick={handleGoToDocuments}
            className="h-8 bg-[#5b5fc7] hover:bg-[#4f52b5] text-white text-[13px] gap-1.5"
            size="sm"
          >
            Open in Documents <ExternalLink size={13} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ───

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <div className="ml-[22px]">{value}</div>
    </div>
  );
}

function DocumentBlockPreview({ block }: { block: { type: string; content?: string; checked?: boolean; calloutEmoji?: string; calloutColor?: string; language?: string } }) {
  switch (block.type) {
    case 'heading1':
      return <p className="text-[16px] font-bold text-[#242424] dark:text-[#f2f3f5] mt-2">{block.content}</p>;
    case 'heading2':
      return <p className="text-[14px] font-bold text-[#242424] dark:text-[#f2f3f5] mt-1.5">{block.content}</p>;
    case 'heading3':
      return <p className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5] mt-1">{block.content}</p>;
    case 'paragraph':
      return <p className="text-[13px] text-[#2e3338] dark:text-[#dbdee1] leading-relaxed">{block.content}</p>;
    case 'bullet':
      return (
        <div className="flex items-start gap-2 ml-2">
          <span className="text-[#616161] dark:text-[#949ba4] mt-0.5">&#8226;</span>
          <span className="text-[13px] text-[#2e3338] dark:text-[#dbdee1]">{block.content}</span>
        </div>
      );
    case 'numbered':
      return (
        <div className="flex items-start gap-2 ml-2">
          <span className="text-[12px] text-[#616161] dark:text-[#949ba4] mt-0.5 font-mono">-</span>
          <span className="text-[13px] text-[#2e3338] dark:text-[#dbdee1]">{block.content}</span>
        </div>
      );
    case 'todo':
      return (
        <div className="flex items-center gap-2 ml-1">
          {block.checked ? (
            <CheckSquare size={14} className="text-[#5b5fc7] shrink-0" />
          ) : (
            <Square size={14} className="text-[#8a8a8a] shrink-0" />
          )}
          <span className={cn(
            'text-[13px]',
            block.checked ? 'line-through text-[#8a8a8a]' : 'text-[#2e3338] dark:text-[#dbdee1]',
          )}>
            {block.content}
          </span>
        </div>
      );
    case 'callout':
      return (
        <div className={cn(
          'flex items-start gap-2 px-3 py-2 rounded-lg border text-[13px]',
          block.calloutColor === 'blue' && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40',
          block.calloutColor === 'yellow' && 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40',
          block.calloutColor === 'green' && 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40',
          block.calloutColor === 'red' && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40',
          block.calloutColor === 'purple' && 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40',
          block.calloutColor === 'gray' && 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800/40',
        )}>
          {block.calloutEmoji && <span className="text-base">{block.calloutEmoji}</span>}
          <span className="text-[#2e3338] dark:text-[#dbdee1]">{block.content}</span>
        </div>
      );
    case 'code':
      return (
        <pre className="bg-[#1e1f22] text-[#dbdee1] text-[12px] font-mono px-3 py-2 rounded-lg overflow-x-auto">
          <code>{block.content}</code>
        </pre>
      );
    case 'divider':
      return <Separator className="my-2 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />;
    case 'quote':
      return (
        <div className="border-l-2 border-[#5b5fc7] pl-3 text-[13px] text-[#616161] dark:text-[#949ba4] italic">
          {block.content}
        </div>
      );
    default:
      return null;
  }
}
