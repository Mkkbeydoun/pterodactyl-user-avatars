# Changelog

## 3.2.0

- Works with Pterodactyl v2.0.0-beta.1 (SDK beta.6).
- The beta removed the user transformers this extension replaced, so pictures had fallen back to Gravatar in admin lists, subusers and activity. Pictures are now put into the panel's API responses directly.

## 3.1.0

- Activity rows with no user behind them (failed logins, scheduled tasks) show a plain system icon instead of a generated pattern.
- New **System picture** setting: admins can upload a picture for those rows instead (Admin, Extensions, User Avatars).

## 3.0.1

- Pictures now show in activity logs (a server's Activity tab, your account activity and the admin activity page). These lists drew a generated avatar and ignored the user's picture.

## 3.0.0

- Renamed the extension from `rustix-avatars` to `user-avatars`, so its API and image URLs now start with `/extensions/user-avatars`. Installing it copies pictures from `rustix-avatars`; remove `rustix-avatars` afterwards.

## 2.0.0

- Removed Gravatar. Users without an upload now always get the default picture (their initial on a coloured circle), including in the navigation bar.
- Removed the "Use Gravatar for users without an upload" setting.

## 1.0.0

- First release.
