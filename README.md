# User Avatars for Pterodactyl

Let users upload their own profile picture, shown in the navigation bar, admin user lists, server subuser lists and activity logs.

## Features

- **Upload a profile picture** from the Account page. PNG, JPEG, WebP and GIF are accepted.
- **Safe storage**: every upload is cropped to a square, resized to 256 pixels and re-encoded (WebP when the server supports it), which strips metadata and anything hidden in the file. Pictures are stored outside the web root and only served to signed-in users.
- **Shown across the panel**: the navigation bar, the admin user list, the admin user page, a server's owner in admin, the server Users list, and activity logs (a server's Activity tab, account activity and admin activity).
- **Admin moderation**: admins can remove a user's picture from the user's admin page.
- **A default picture for everyone else**: users without an upload get their initial on a coloured circle. Nothing is loaded from Gravatar or any other outside service.
- **Settings** under **Admin → Extensions → User Avatars**: the largest upload size.

## How it works

Pterodactyl 2.0 has no avatar uploads. Core draws a generated pattern in the navigation bar and loads Gravatar images in admin and subuser lists. This extension replaces both with the user's upload or the default picture.

- Lists that show a user's `image` (admin users, server owner, subusers) get the user's picture because this extension replaces the panel's user transformers with versions that swap in the uploaded URL. If another extension also replaces `Pterodactyl\Transformers\Api\Client\UserTransformer` or `Pterodactyl\Transformers\Api\Admin\UserTransformer`, only one of them will win.
- The navigation bar avatar is not a replaceable component in 2.0, so the user's picture is laid over it with CSS that targets the "Account Settings" link. A panel update that changes that link could break it; the rest of the extension is unaffected.
- Activity rows draw a generated avatar from the username and are not replaceable either. The activity API already includes each actor's picture, so the extension matches rows to it by username and lays the picture over the generated avatar. Rows with no user (shown as "System") get the picture set in the extension's **System picture** setting, or a plain system icon when none is set. A panel update that changes the activity row layout could break it.

## API

| Method | Path | Who |
|---|---|---|
| GET, POST, DELETE | `/api/client/extensions/user-avatars/me` | The signed-in user (POST takes a multipart `avatar` file) |
| GET, DELETE | `/api/admin/extensions/user-avatars/users/{id}` | Root admins |
| GET | `/extensions/user-avatars/a/{token}` | Signed-in users (the image itself) |

## Requirements

- Pterodactyl Panel 2.0 (2.0-develop or later)
- PHP 8.3+ (the GD extension is recommended; without it only PNG, JPEG and WebP are accepted and stored as uploaded)

## Install

From a release archive (`user-avatars-1.0.0.pteroext`):

```sh
php artisan p:extension:install /path/to/user-avatars-1.0.0.pteroext --enable
```

Or upload the archive under **Admin → Extensions**. Reload the panel afterwards.

## Build from source

```sh
npm ci
npm run typecheck
npm test
npm run build
php artisan p:extension:doctor /path/to/user-avatars
php artisan p:extension:pack /path/to/user-avatars
```

## Upgrading from rustix-avatars

Up to 2.0.0 this extension was called `rustix-avatars`. Install `user-avatars`, which copies everyone's pictures across, then remove the old one:

```sh
php artisan p:extension:remove rustix-avatars
```

## Uninstall

```sh
php artisan p:extension:remove user-avatars
```

## License

MIT. See [LICENSE](LICENSE).

This is a community extension and is not affiliated with or endorsed by Pterodactyl.
