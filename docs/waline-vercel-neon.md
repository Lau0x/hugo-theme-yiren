# Waline + Vercel + Neon Comments

- [中文教程](#中文教程)
- [English Guide](#english-guide)
- [Back to README](../README.md)

---

## 中文教程

这篇教程适合想在 Yu 主题里开启 Waline 评论，同时不想自己维护服务器的人。整体思路是：

1. 用 Vercel 部署 Waline 服务端。
2. 用 Neon 提供 PostgreSQL 数据库。
3. 在 Hugo 配置里填入 Waline 服务地址。
4. 注册第一个管理员账号。

### 准备

你需要：

- 一个 GitHub 账号
- 一个 Vercel 账号
- 一个 Neon 数据库，推荐直接通过 Vercel Storage 创建
- 一个已经使用 Yu 主题的 Hugo 站点

### 1. 部署 Waline 到 Vercel

打开 Waline 官方 Vercel 部署文档：

https://waline.js.org/en/guide/deploy/vercel.html

点击部署按钮后，在 Vercel 里创建项目。项目名可以自定义，例如：

```text
my-waline
```

创建完成后，Vercel 会生成一个 Waline 服务地址，类似：

```text
https://your-waline.vercel.app
```

第一次打开时如果看到服务端报错，通常是因为数据库还没有配置好，继续下一步即可。

### 2. 创建 Neon 数据库

进入 Vercel 项目的 Storage 页面：

1. 选择 `Create Database`
2. 在 Marketplace Database Providers 里选择 `Neon`
3. 选择 Free 计划
4. 区域可以先用默认值
5. 创建完成后，把它连接到你的 Waline 项目

连接时建议勾选：

- `Production`
- `Preview`

`Development` 可以先不勾选，除非你要在本地跑 Waline 服务端。

### 3. 初始化 Waline 数据表

数据库创建成功后，点击 `Open in Neon`，进入 Neon 控制台。

然后：

1. 打开左侧 `SQL Editor`
2. 复制 Waline 官方文档里的 `waline.pgsql`
3. 粘贴到 SQL Editor
4. 点击 `Run`

看到执行成功后，说明评论表已经建好。

### 4. 重新部署 Vercel 项目

回到 Vercel 的 Waline 项目，进入最新部署，点击 `Redeploy`。

这一步是为了让新加入的数据库环境变量生效。重新部署成功后，打开你的 Waline 地址，应该能看到评论框。

### 5. 注册管理员

打开：

```text
https://your-waline.vercel.app/ui/register
```

第一个注册的用户会成为管理员。注册后可以进入：

```text
https://your-waline.vercel.app/ui
```

在这里管理评论、审核评论、删除垃圾评论。

### 6. 在 Hugo 站点启用评论

在站点的 `hugo.toml` 里加入：

```toml
[params.comments]
provider = 'waline'

[params.comments.waline]
serverURL = 'https://your-waline.vercel.app'
lang = 'zh-CN'
```

把 `serverURL` 替换成你自己的 Waline 地址。

### 7. 本地检查

回到 Hugo 站点目录，运行：

```bash
hugo server -D
```

打开任意文章页，底部应该会出现 Waline 评论框。

### 8. 发布

确认没问题后，提交并推送你的 Hugo 站点源码。Cloudflare Pages 会自动重新构建。

```bash
git add -A
git commit -m "Enable Waline comments"
git push
```

### 常见问题

#### 打开 Waline 地址显示 500

优先检查两件事：

- Neon 数据库是否已经连接到 Vercel 项目
- Vercel 是否在连接数据库后重新部署过

#### 评论框显示了，但提交失败

进入 Vercel 的 Waline 项目查看 Logs。常见原因是数据库环境变量没有生效，或者 SQL 表没有初始化成功。

#### 需要绑定自己的域名吗？

不是必须。直接使用 `vercel.app` 地址也可以。如果你想后续迁移更方便，可以给 Waline 绑定一个独立子域名，例如：

```text
comments.example.com
```

之后 Hugo 里只需要把 `serverURL` 改成这个域名。

如果你的域名 DNS 托管在 Cloudflare，可以先使用 `DNS only`。确认可用后，再按自己的网络情况决定是否开启代理。

#### 可以以后从 Waline 迁移到别的评论系统吗？

可以。Yu 主题的评论入口是可插拔的，换评论系统主要改 `params.comments.provider` 和对应配置。评论数据迁移取决于目标系统是否支持导入，建议定期从数据库导出备份。

---

## English Guide

This guide explains how to enable Waline comments for the Yu theme without maintaining your own server. The setup uses Vercel for the Waline server and Neon for PostgreSQL.

### Requirements

You need:

- A GitHub account
- A Vercel account
- A Neon PostgreSQL database, preferably created through Vercel Storage
- A Hugo site using the Yu theme

### 1. Deploy Waline To Vercel

Open the official Waline Vercel deployment guide:

https://waline.js.org/en/guide/deploy/vercel.html

Use the deploy button and create a Vercel project. You can name it something like:

```text
my-waline
```

After deployment, Vercel will give you a server URL like:

```text
https://your-waline.vercel.app
```

If the first visit shows a server error, continue with the database setup. The Waline server needs a database before it can work.

### 2. Create A Neon Database

In your Vercel project, go to Storage:

1. Click `Create Database`
2. Choose `Neon` under Marketplace Database Providers
3. Select the Free plan
4. Keep the default region if you are unsure
5. Connect the database to your Waline project

Recommended environments:

- `Production`
- `Preview`

You can skip `Development` unless you plan to run the Waline server locally.

### 3. Initialize Waline Tables

After creating the database, click `Open in Neon`.

Then:

1. Open `SQL Editor`
2. Copy `waline.pgsql` from the official Waline guide
3. Paste it into the editor
4. Click `Run`

When the SQL succeeds, the comment tables are ready.

### 4. Redeploy The Vercel Project

Go back to the Waline project in Vercel and redeploy the latest deployment.

This makes the newly created database environment variables available to the server. After the redeploy succeeds, open your Waline URL again. You should see the comment UI.

### 5. Register The Admin User

Open:

```text
https://your-waline.vercel.app/ui/register
```

The first registered user becomes the administrator. After registration, manage comments at:

```text
https://your-waline.vercel.app/ui
```

### 6. Enable Comments In Hugo

Add this to your site's `hugo.toml`:

```toml
[params.comments]
provider = 'waline'

[params.comments.waline]
serverURL = 'https://your-waline.vercel.app'
lang = 'zh-CN'
```

Replace `serverURL` with your own Waline server URL.

### 7. Preview Locally

Run this inside your Hugo site:

```bash
hugo server -D
```

Open any post page. The Waline comment box should appear near the bottom.

### 8. Publish

Commit and push your Hugo site. Cloudflare Pages will rebuild it automatically.

```bash
git add -A
git commit -m "Enable Waline comments"
git push
```

### Troubleshooting

#### The Waline URL Shows 500

Check whether the Neon database is connected to your Vercel project and whether you redeployed after connecting it.

#### The Comment Box Appears But Submit Fails

Check the Vercel Logs for your Waline project. Common causes include missing database environment variables or tables that were not initialized.

#### Do I Need A Custom Domain?

No. The `vercel.app` URL is enough. A custom subdomain such as `comments.example.com` can make future migration easier, but it is optional.

If your DNS is hosted on Cloudflare, start with `DNS only`. After the domain works, decide whether to enable proxying based on your own network tests.

#### Can I Migrate Away From Waline Later?

Yes. Yu uses a pluggable comment provider config. Switching providers mainly means changing `params.comments.provider` and the provider-specific settings. Data migration depends on the destination system, so keep regular database backups.
