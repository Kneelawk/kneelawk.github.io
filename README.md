# Kneelawk's Website

This houses the frontend for Kneelawk's website. The backend can be
found [in the src2 branch](https://github.com/Kneelawk/kneelawk.github.io/tree/src2).

This site uses [Astro](https://astro.build/) for the front end and [Actix](https://actix.rs/) for the backend.

## Cloning

This repository has some very large branches from older versions of the website. You will normally only want to clone
the branch you actually want to use.

```bash
git clone --single-branch git@github.com:Kneelawk/kneelawk.github.io.git
```

If you want to clone the server-side branch instead, you can use:

```bash
git clone -b src2 --single-branch git@github.com:Kneelawk/kneelawk.github.io.git
```

## Development

You can run this site in a dev environment using:

```bash
npm run dev
```
