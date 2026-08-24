import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Eye,
  FileImage,
  FileText,
  Loader2,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  Upload,
} from "lucide-react";

import { supabase } from "../../../supabase"

const emptyForm = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  content: "",
  cover_image_url: "",
  status: "draft",
  published_at: null,
};

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value) {
  if (!value) return "Not published";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminBlogPage({ userId, role }) {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);

  const isAdmin = [
    "owner",
    "operations_admin",
    "tech_admin",
  ].includes(role);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPosts();
    }
  }, [isAdmin, loadPosts]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleTitleChange(value) {
    setForm((current) => ({
      ...current,
      title: value,
      slug:
        !current.id || current.slug === createSlug(current.title)
          ? createSlug(value)
          : current.slug,
    }));
  }

  function startCreating() {
    setForm(emptyForm);
    setMessage(null);
    setView("editor");
  }

  function startEditing(post) {
    setForm({
      ...emptyForm,
      ...post,
    });

    setMessage(null);
    setView("editor");
  }

  function returnToList() {
    setForm(emptyForm);
    setMessage(null);
    setView("list");
  }

  async function uploadCoverImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please choose an image file.",
      });

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "The cover image must be smaller than 5 MB.",
      });

      return;
    }

    setUploading(true);
    setMessage(null);

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-covers")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setMessage({
        type: "error",
        text: uploadError.message,
      });

      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("blog-covers")
      .getPublicUrl(fileName);

    updateField("cover_image_url", data.publicUrl);

    setMessage({
      type: "success",
      text: "Cover image uploaded.",
    });

    setUploading(false);
  }

  async function savePost(status) {
    const title = form.title.trim();
    const slug = createSlug(form.slug || form.title);
    const content = form.content.trim();

    if (!title || !slug || !content) {
      setMessage({
        type: "error",
        text: "Title, slug and article content are required.",
      });

      return;
    }

    setSaving(true);
    setMessage(null);

    const publishedAt =
      status === "published"
        ? form.published_at || new Date().toISOString()
        : null;

    const payload = {
      title,
      slug,
      excerpt: form.excerpt.trim() || null,
      category: form.category.trim() || null,
      content,
      cover_image_url:
        form.cover_image_url.trim() || null,
      status,
      author_id: userId,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (form.id) {
      result = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", form.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("blog_posts")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      setMessage({
        type: "error",
        text:
          result.error.code === "23505"
            ? "That slug is already being used."
            : result.error.message,
      });

      setSaving(false);
      return;
    }

    setForm({
      ...emptyForm,
      ...result.data,
    });

    setMessage({
      type: "success",
      text:
        status === "published"
          ? "Article published successfully."
          : "Draft saved successfully.",
    });

    await loadPosts();
    setSaving(false);
    setView("list");
  }

  async function deletePost(post) {
    const confirmed = window.confirm(
      `Delete “${post.title}”? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(post.id);
    setMessage(null);

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } else {
      setPosts((current) =>
        current.filter((item) => item.id !== post.id)
      );

      setMessage({
        type: "success",
        text: "Article deleted.",
      });
    }

    setDeletingId(null);
  }

  const filteredPosts = posts.filter((post) => {
    const value = search.toLowerCase();

    return (
      post.title?.toLowerCase().includes(value) ||
      post.category?.toLowerCase().includes(value) ||
      post.status?.toLowerCase().includes(value)
    );
  });

  if (!isAdmin) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          You do not have permission to manage blog posts.
        </div>
      </div>
    );
  }

  if (view === "editor") {
    return (
      <div className="min-h-screen p-5 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={returnToList}
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-purple-600"
          >
            <ArrowLeft size={17} />
            Back to articles
          </button>

          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">
                Blog Management
              </p>

              <h1 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
                {form.id ? "Edit Article" : "Create Article"}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => savePost("draft")}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-50 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                Save Draft
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => savePost("published")}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-600 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}

                Publish
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
                message.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Article title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleTitleChange(event.target.value)
                  }
                  placeholder="Enter the article title"
                  className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Slug
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    updateField(
                      "slug",
                      createSlug(event.target.value)
                    )
                  }
                  placeholder="article-url-slug"
                  className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Short excerpt
                </label>

                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(event) =>
                    updateField("excerpt", event.target.value)
                  }
                  placeholder="A short description displayed on the blog page"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Article content
                </label>

                <textarea
                  rows={18}
                  value={form.content}
                  onChange={(event) =>
                    updateField("content", event.target.value)
                  }
                  placeholder="Write the full article..."
                  className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 leading-7 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-white/10"
                />
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <label className="mb-2 block text-sm font-bold">
                  Category
                </label>

                <input
                  type="text"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="Education"
                  className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 outline-none transition focus:border-purple-500 dark:border-white/10"
                />
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="mb-3 text-sm font-bold">
                  Cover image
                </p>

                {form.cover_image_url ? (
                  <img
                    src={form.cover_image_url}
                    alt="Article cover preview"
                    className="mb-4 aspect-video w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-purple-50 text-purple-300">
                    <FileImage size={35} />
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-50">
                  {uploading ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Upload size={17} />
                  )}

                  {uploading
                    ? "Uploading..."
                    : "Upload Image"}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={uploadCoverImage}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="font-bold">Current status</p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    form.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {form.status || "draft"}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">
              Website Content
            </p>

            <h1 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
              Blog Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create, edit, publish and manage website articles.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-5 py-3 font-bold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:bg-pink-600"
          >
            <Plus size={18} />
            New Article
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Search
            size={19}
            className="text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search articles..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-white/5">
            <FileText
              size={40}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-xl font-bold">
              No articles found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Create your first Tech Talk Hub article.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4">Article</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="transition hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt=""
                              className="h-14 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-purple-50 text-purple-300">
                              <FileImage size={23} />
                            </div>
                          )}

                          <div>
                            <p className="max-w-sm font-bold text-gray-900 dark:text-white">
                              {post.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              /blog/{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                        {post.category || "Uncategorized"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            post.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <Calendar size={14} />

                          {formatDate(
                            post.published_at ||
                              post.created_at
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {post.status === "published" && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View article"
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye size={17} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => startEditing(post)}
                            title="Edit article"
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-purple-50 hover:text-purple-600"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === post.id}
                            onClick={() => deletePost(post)}
                            title="Delete article"
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === post.id ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}