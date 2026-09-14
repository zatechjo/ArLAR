"use client";

import { Image as ImageExtension } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AlignCenter, AlignLeft, Bold, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Paperclip, Quote, Redo2, Underline as UnderlineIcon, Undo2 } from "lucide-react";
import { useState } from "react";
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import type { AdminMediaItem } from "@/lib/admin-media";

const AdjustableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: { default: "large", parseHTML: (element) => element.getAttribute("data-size") || "large", renderHTML: (attributes) => ({ "data-size": attributes.size }) },
      align: { default: "left", parseHTML: (element) => element.getAttribute("data-align") || "left", renderHTML: (attributes) => ({ "data-align": attributes.align }) },
    };
  },
}).configure({ inline: false, allowBase64: true });

const imageSizes = ["small", "medium", "large"] as const;
type ImageSize = (typeof imageSizes)[number];
type RichEditorProps = { name: string; media: AdminMediaItem[]; defaultHtml?: string; dir?: "ltr" | "rtl"; onChange?: (html: string) => void; onImageUploaded?: (url: string) => void };

export function RichTextEditor({ name, media, defaultHtml = "", dir = "ltr", onChange, onImageUploaded }: RichEditorProps) {
  const [html, setHtml] = useState(defaultHtml || "<p></p>");
  const [json, setJson] = useState("");
  const [mediaMode, setMediaMode] = useState<"image" | "document" | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ link: { openOnClick: false, defaultProtocol: "https" } }), TextStyle, FontSize, TextAlign.configure({ types: ["heading", "paragraph"] }), AdjustableImage],
    content: html,
    editorProps: { attributes: { dir, class: "jsr-editor-content" } },
    onCreate: ({ editor: currentEditor }) => setJson(JSON.stringify(currentEditor.getJSON())),
    onUpdate: ({ editor: currentEditor }) => { const nextHtml = currentEditor.getHTML(); setHtml(nextHtml); setJson(JSON.stringify(currentEditor.getJSON())); onChange?.(nextHtml); },
  });
  const imageState = useEditorState({ editor, selector: ({ editor: currentEditor }) => { if (!currentEditor) return { count: 0, commonSize: null as string | null }; const sizes: string[] = []; currentEditor.state.doc.descendants((node) => { if (node.type.name === "image") sizes.push(String(node.attrs.size || "large")); }); const firstSize = sizes[0] ?? null; return { count: sizes.length, commonSize: firstSize && sizes.every((size) => size === firstSize) ? firstSize : null }; } });

  function insertInlineImage(url: string, item: AdminMediaItem) { editor?.chain().focus().insertContent([{ type: "image", attrs: { src: url, alt: item.name, size: "large", align: "left" } }, { type: "paragraph" }]).run(); onImageUploaded?.(url); }
  function insertAttachment(url: string, item: AdminMediaItem) { const suggested = item.name || "file"; const label = (window.prompt("Button label", `Download ${suggested}`) || suggested).replace(/[<>]/g, "").trim() || "Download file"; editor?.chain().focus().insertContent([{ type: "paragraph", content: [{ type: "text", text: label, marks: [{ type: "link", attrs: { href: url } }] }] }, { type: "paragraph" }]).run(); }
  function setLink() { const previous = editor?.getAttributes("link").href as string | undefined; const href = window.prompt("Link URL", previous ?? "https://"); if (href === null) return; if (!href.trim()) editor?.chain().focus().unsetLink().run(); else editor?.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run(); }
  function setAllImageSizes(size: ImageSize) { editor?.chain().focus().command(({ state, tr }) => { state.doc.descendants((node, position) => { if (node.type.name === "image") tr.setNodeMarkup(position, undefined, { ...node.attrs, size }, node.marks); }); return true; }).run(); }
  const textStyle = editor?.isActive("heading", { level: 2 }) ? "h2" : editor?.isActive("heading", { level: 3 }) ? "h3" : editor?.isActive("heading", { level: 4 }) ? "h4" : "paragraph";
  const activeFontSize = editor?.getAttributes("textStyle").fontSize as string | undefined;
  const fontSize = activeFontSize === "16px" ? "" : (activeFontSize ?? "");

  return <div className="jsr-rich-editor" dir={dir}><div className="jsr-editor-toolbar" role="toolbar" aria-label="Text formatting"><select aria-label="Text style" value={textStyle} onChange={(event) => { const value = event.target.value; if (value === "paragraph") editor?.chain().focus().setParagraph().run(); else editor?.chain().focus().setHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run(); }}><option value="paragraph">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option></select><select aria-label="Font size" value={fontSize} onChange={(event) => { const value = event.target.value; if (value) editor?.chain().focus().setFontSize(value).run(); else editor?.chain().focus().unsetFontSize().run(); }}><option value="">Normal</option><option value="14px">Small</option><option value="20px">Large</option><option value="26px">Extra large</option></select><Tool label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={16} /></Tool><Tool label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={16} /></Tool><Tool label="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></Tool><Tool label="Bulleted list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={16} /></Tool><Tool label="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Tool><Tool label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Tool><Tool label="Add link" active={editor?.isActive("link")} onClick={setLink}><LinkIcon size={16} /></Tool><Tool label="Align left" active={editor?.isActive({ textAlign: "left" })} onClick={() => editor?.chain().focus().setTextAlign("left").run()}><AlignLeft size={16} /></Tool><Tool label="Align center" active={editor?.isActive({ textAlign: "center" })} onClick={() => editor?.chain().focus().setTextAlign("center").run()}><AlignCenter size={16} /></Tool><Tool label="Add inline image from Website Media" onClick={() => setMediaMode("image")}><ImagePlus size={16} /></Tool><Tool label="Attach a file from Website Media" onClick={() => setMediaMode("document")}><Paperclip size={16} /></Tool><span className="jsr-editor-toolbar__spacer" aria-hidden="true" /><Tool label="Undo" disabled={!editor?.can().chain().focus().undo().run()} onClick={() => editor?.chain().focus().undo().run()}><Undo2 size={16} /></Tool><Tool label="Redo" disabled={!editor?.can().chain().focus().redo().run()} onClick={() => editor?.chain().focus().redo().run()}><Redo2 size={16} /></Tool></div>{(imageState?.count ?? 0) > 0 ? <div className="jsr-image-toolbar" role="toolbar" aria-label="All image controls"><strong>All images</strong><span>Size</span>{imageSizes.map((size) => <Tool key={size} label={`Make all images ${size}`} active={imageState?.commonSize === size} onClick={() => setAllImageSizes(size)}>{size[0].toUpperCase() + size.slice(1)}</Tool>)}<small>The selected size applies to every image in this article.</small></div> : null}<EditorContent editor={editor} /><input type="hidden" name={name} value={html} /><input type="hidden" name={`${name}_json`} value={json} />{mediaMode ? <MediaLibraryDialog open items={media} selectKind={mediaMode} title={mediaMode === "image" ? "Insert image into article" : "Attach document to article"} onClose={() => setMediaMode(null)} onSelect={mediaMode === "image" ? insertInlineImage : insertAttachment} /> : null}</div>;
}

function Tool({ children, label, active, disabled, onClick }: { children: React.ReactNode; label: string; active?: boolean; disabled?: boolean; onClick: () => void }) { return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} className={active ? "is-active" : ""} onClick={onClick}>{children}</button>; }
