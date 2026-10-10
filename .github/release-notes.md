Profile picture uploads for Pterodactyl Panel v2.

- Users upload a picture from their Account page. It is cropped to a square, resized to 256 pixels and re-encoded.
- It shows in the navigation bar, the admin user list and user page, and server subuser lists.
- Admins can remove any user's picture.
- Gravatar can be turned off in the extension settings. Users without an upload then get their initial on a coloured circle.

## Install

Download `rustix-avatars-${VERSION}.pteroext` below, then either upload it under **Admin → Extensions**, or run:

```sh
php artisan p:extension:install /path/to/rustix-avatars-${VERSION}.pteroext --enable
```

Requires Pterodactyl Panel 2.0 (2.0-develop or later) and PHP 8.3+.

This is a community extension and is not affiliated with or endorsed by Pterodactyl.
