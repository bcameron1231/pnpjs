import { MSAL } from "@pnp/msaljsclient/index.js";
import { spfi, SPBrowser, And, TextField, Or, NumberField } from "@pnp/sp";
import "@pnp/sp/webs";
import { settings } from "../../settings.js";
// import { graph } from "@pnp/graph/presets/all";
import "@pnp/sp/presets/all";

// ******
// Please edit this file and do any testing required. Please do not submit changes as part of a PR.
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
            const sp = spfi().using(
                SPBrowser({ baseUrl: settings.testing.sp.url}), 
                MSAL(settings.testing.sp.msal.init, {scopes: settings.testing.sp.msal.scopes})
            );

             // Example usage:
             interface ISPFxListType {
                Title: string;
                SPFxAmount: number;
                CostCenter: string;
              }
            
              await sp.web.lists.getByTitle("SPFx List").items.filter<ISPFxListType>(Or([
                TextField("Title").Equals("Test"),
                TextField("Title").Equals("Cameron")
              ]))();
             await sp.web.lists.getByTitle("SPFx List").items.filter<ISPFxListType>(And([
                TextField("Title").Equals("Cameron"),
                NumberField("SPFxAmount").GreaterThan(0),
              ]))();

             await sp.web.lists.getByTitle("SPFx List").items.filter<ISPFxListType>(Or([And([
                TextField("Title").Equals("Test"),
                NumberField("SPFxAmount").GreaterThan(0),
              ]), TextField("Title").Equals("Test")]))();

            const r = await sp.web();

            html.push(`<textarea cols="200" rows="40">${JSON.stringify(r, null, 4)}</textarea>`);

        } catch (e) {
            html.push(`Error: <pre>${JSON.stringify(e.message, null, 4)}</pre>`);
        }

        e.innerHTML = html.join("<br />");
    }
};
