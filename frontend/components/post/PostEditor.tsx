'use client';

import { useDeferredValue, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tag from '@/components/ui/Tag';
import { useForum } from '@/lib/forumStore';
import { EditorPostDraft } from '@/lib/types';
import {api} from '@/lib/axios';
import axios from 'axios';


type PostEditorProps = {
  mode: 'create' | 'edit';
  initialValue?: EditorPostDraft;
  onSubmit: (draft: EditorPostDraft) => void;
  onDelete?: () => void;
};

const emptyDraft: EditorPostDraft = {
  title: '',
  content: '',
  tags: [],
  image: '',
};

export default function PostEditor({ mode, initialValue = emptyDraft, onSubmit, onDelete }: PostEditorProps) {
  const { tags } = useForum();
  const [draft, setDraft] = useState<EditorPostDraft>(initialValue);
  const [tagValue, setTagValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deferredTagValue = useDeferredValue(tagValue);

  const popularTags = useMemo(() => tags.slice(0, 10), [tags]);
  const recommendedTags = useMemo(() => {
    const normalized = deferredTagValue.trim().toLowerCase();
    const availableTags = tags.filter((tag) => !draft.tags.includes(tag));

    if (!normalized) {
      return availableTags.slice(0, 8);
    }

    return availableTags.filter((tag) => tag.includes(normalized)).slice(0, 8);
  }, [deferredTagValue, draft.tags, tags]);

  const addTag = () => {
    const nextTag = tagValue.trim().toLowerCase();
    if (!nextTag || draft.tags.includes(nextTag)) return;
    setDraft((prev) => ({ ...prev, tags: [...prev.tags, nextTag] }));
    setTagValue('');
  };

  const addSuggestedTag = (tag: string) => {
    if (draft.tags.includes(tag)) return;
    setDraft((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagValue('');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="card-surface p-6">
        <div className="space-y-5">
          <Input id="post-title" label="Title" value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="Write a strong headline" />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Content</span>
            <textarea
              value={draft.content}
              onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Share the problem, the decisions you made, and what others can learn from it."
              className="min-h-[320px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition-all duration-200 focus:border-forum-primary"
            />
          </label>
          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700">Cover image</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Upload image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result;
                    if (typeof result === 'string') {
                      setDraft((prev) => ({ ...prev, image: result }));
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
              {draft.image ? <span className="text-xs text-slate-500">Image ready</span> : <span className="text-xs text-slate-500">Use a local file for mock preview</span>}
            </div>
          </div>
          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700">Tags</span>
            <div className="flex gap-3">
              <input
                value={tagValue}
                onChange={(event) => setTagValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag"
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-forum-primary"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.tags.map((tag) => (
                <Tag key={tag} label={tag} onClick={() => setDraft((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }))} />
              ))}
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Popular tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Tag key={`popular-${tag}`} label={tag} onClick={() => addSuggestedTag(tag)} />
                ))}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Recommendations</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendedTags.length ? (
                  recommendedTags.map((tag) => <Tag key={`suggested-${tag}`} label={tag} onClick={() => addSuggestedTag(tag)} />)
                ) : (
                  <span className="text-sm text-slate-400">No matching tags yet. Press Enter to create one.</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
          {mode === 'edit' && onDelete ? (
            <Button type="button" variant="outline" className="border-rose-200 text-rose-500 hover:border-rose-300 hover:text-rose-600" onClick={onDelete}>
              Delete post
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => onSubmit(draft)}
            disabled={!draft.title.trim() || !draft.content.trim()}
          >
            {mode === 'create' ? 'Publish post' : 'Save changes'}
          </Button>
        </div>
      </section>

      <aside className="card-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Preview post</h3>
            <p className="text-sm text-slate-500">Check the final reading experience before publishing.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Preview</span>
        </div>
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {draft.tags.length ? draft.tags.map((tag) => <Tag key={tag} label={tag} />) : <span className="text-sm text-slate-400">No tags yet</span>}
          </div>
          <h4 className="text-2xl font-bold leading-tight text-slate-900">{draft.title || 'Your post title will appear here'}</h4>
          {draft.image ? (
            <div className="relative h-52 overflow-hidden rounded-3xl border border-slate-200">
              <Image src={draft.image} alt="Preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
              Upload an image to preview it here
            </div>
          )}
          <div className="space-y-4 text-sm leading-7 text-slate-600">
            {(draft.content || 'Your content preview will appear here.').split('\n\n').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
