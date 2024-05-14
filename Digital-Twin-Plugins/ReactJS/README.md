# Configuration

Open the file ./config/module.json

```
{
  "id": "pbcModule",
  "pathTemplate": "./src/index.html",
  "routeCapabilities": "remote.js",
  "devServerPort": 9091,
  "pathTypescript": "public/types",
  "pathPublicAssets": ["..","public"],
  "remotes": [],
  "exposes": {}
}
```

Change the devServerPort to a free port and the name of the module. Then expose any new components you develop.

```
    "./pages/Page1": "./src/components/pages/Page1.tsx",
    "./pages/Page2": "./src/components/pages/Page2.tsx"
```

In `remotes` you can list the projects you want to use in this module, e.g. pbcServices, pbcUX. You can check registry for the list of PBCs available.
