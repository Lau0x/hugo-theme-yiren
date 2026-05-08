# Yiren

Yiren is a quiet Hugo theme for Chinese personal blogs and weekly digests. It focuses on a narrow reading column, warm paper-like background, cover cards, Chinese typography, article table of contents, lightweight search, and Medium-style image zoom.

## Features

- Sticky translucent header
- Post cards with cover image gradient overlay
- Automatic home card cover from the first Markdown image
- Chinese-friendly typography with LXGW WenKai
- Article reading time and wide-screen table of contents
- System dark mode with a manual toggle
- Moments section for short micro-posts
- Friends link page powered by `data/links.yaml`
- Click-to-zoom article images
- Code block copy button
- JSON-powered local search
- Tags and taxonomy pages

## Install

Add the theme to your Hugo site:

```bash
git submodule add https://github.com/Lau0x/hugo-theme-yiren.git themes/yiren
```

Set the theme in `hugo.toml`:

```toml
theme = 'yiren'
```

## Basic Config

```toml
baseURL = 'https://example.org/'
locale = 'zh-CN'
title = '咕咕的博客'
theme = 'yiren'
summaryLength = 36

[params]
lang = 'zh-CN'
description = '个人博客'
author = '咕咕'
footer = '© 2026 咕咕'
mainSections = ['posts']
projectsURL = '/projects/'

[outputs]
home = ['HTML', 'RSS', 'JSON']
```

Create `content/search.md` to enable the search page:

```toml
+++
title = '搜索'
layout = 'search'
+++
```

## Post Cover

Use `cover`, `image`, or `images` in front matter:

```toml
+++
title = '周刊 186'
date = '2026-04-18T10:45:00+08:00'
cover = '/uploads/cover.jpg'
tags = ['周刊', '创客']
+++
```

If no cover is set, the home card will use the first Markdown image in the post body.

## Moments

Create short notes under `content/moments`:

```bash
hugo new moments/2026-05-08-note.md
```

The note body is rendered directly on `/moments/`, so it works well for quick thoughts, photos, or small updates:

```yaml
---
title: "2026-05-08 09:00"
date: 2026-05-08T09:00:00+08:00
draft: false
mood: 随手记
---

今天随手记一笔。
```

## Friends Links

Create `content/links/_index.md`:

```yaml
---
title: 友情链接
---
```

Then add links in `data/links.yaml`:

```yaml
- name: Hugo
  url: https://gohugo.io/
  description: 快速、灵活的静态网站生成器。
```

## Custom URLs And Static Pages

Use `slug` to customize the final path segment:

```yaml
---
title: Hello World
slug: hello-world
---
```

Use `url` to customize the full path:

```yaml
---
title: Project Hub
url: /projects/maker-tools/
---
```

For a completely standalone HTML page, put it under `static`, for example `static/projects/index.html`. It will be available at `/projects/`.

## Preview Example Site

From the parent directory that contains `hugo-theme-yiren`:

```bash
hugo server --source hugo-theme-yiren/exampleSite --themesDir . --theme hugo-theme-yiren -D
```
