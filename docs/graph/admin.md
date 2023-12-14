# @pnp/graph/admin

The ability to work with Microsoft Graph Admin APIs

## Admin, IAdmin, SharePointSettings, ISharePointSettings

[![Invokable Banner](https://img.shields.io/badge/Invokable-informational.svg)](../concepts/invokable.md) [![Selective Imports Banner](https://img.shields.io/badge/Selective%20Imports-informational.svg)](../concepts/selective-imports.md)  

## Get SharePoint Tenant Settings

Using sharePointSettings() you can retrieve the SharePoint Tenant Settings

```TypeScript
import { graphfi } from "@pnp/graph";
import "@pnp/graph/admin";

const graph = graphfi(...);

const settings = await graph.admin.sharepoint.settings();

```
## Update SharePoint Tenant Settings

Update SharePoint Tenant Settings

```TypeScript
import { graphfi } from "@pnp/graph";
import "@pnp/graph/admin";

const graph = graphfi(...);

const settings = await graph.admin.sharepoint.settings.update({deletedUserPersonalSiteRetentionPeriodInDays: 5, isCommentingOnSitePagesEnabled: true});

```