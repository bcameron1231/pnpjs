import { MSAL } from "@pnp/msaljsclient/index.js";
import { spfi, SPBrowser } from "@pnp/sp";
import "@pnp/sp/webs";
import { settings } from "../../settings.js";
import { graphfi } from "@pnp/graph/fi.js";
import { GraphBrowser } from "@pnp/graph/index.js"; 
import "@pnp/graph/presets/all";
import "@pnp/graph/admin";
// ******
// Please edit this file and do any testing required. Please do not submit changes as partnpmnp of a PR.
// ******

// ensure our DOM is ready for us to do stuff
document.onreadystatechange = async () => {

    if (document.readyState === "interactive") {

        // uncomment this to test with verbose mode
        // sp.setup({
        //     sp: {
        //         headers: {
        //             "Accept": "application/json;odata=verbose",
        //         },
        //     },
        // });

        const e = document.getElementById("pnp-test");

        const html = [];

        try {

            // Make sure to add `https://localhost:8080/spa.html` as a Redirect URI in your testing's AAD App Registration
            const graph = graphfi().using(
                GraphBrowser({ baseUrl: settings.testing.graph.url}), 
                MSAL(settings.testing.graph.msal.init, {scopes: settings.testing.graph.msal.scopes})
            );
                
          // const sharePointSettings = await graph.admin.sharepoint.settings();
           const health = await graph.admin.serviceAnnouncements.healthOverviews();

          //  html.push(`<textarea cols="200" rows="40">${JSON.stringify(r, null, 4)}</textarea>`);

        } catch (e) {
            html.push(`Error: <pre>${JSON.stringify(e.message, null, 4)}</pre>`);
        }

        e.innerHTML = html.join("<br />");
    }
};
