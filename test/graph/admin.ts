import { expect } from "chai";
import { getRandomString, stringIsNullOrEmpty } from "@pnp/core";
import { pnpTest } from "../pnp-test.js";
import "@pnp/graph/admin";

describe("Admin", function () {
    const customUserProperty = "CustomAttribute1";
    let propertyId = "";

    // Ensure we have the data to test against
    before(async function  () {

        if (!this.pnp.settings.enableWebTests || stringIsNullOrEmpty(this.pnp.settings.testUser)) {
            this.skip();
        }

        // Get a sample property
        try {
            const property = await this.pnp.graph.admin.people.profileCardProperties.add({
                directoryPropertyName: customUserProperty,
                annotations: [{
                    displayName: "Cost Center",
                    localizations: [
                        {
                            languageTag: "ru-RU",
                            displayName: "центр затрат",
                        },
                    ],
                }],
            });
            propertyId = property.id;
        } catch (err) {
            console.log("Could not set test values for Admin");
        }
    });

    describe("SharePoint", function () {
        it("Get SharePoint Settings", pnpTest("923c1bd6-8621-41d2-9ea9-004a4a735c9f", async function  () {
            const sharePointSettings = await this.pnp.graph.admin.sharepoint.settings();
            return expect(sharePointSettings.availableManagedPathsForSiteCreation.length > 0).is.true;
        }));

        it("Update SharePoint Settings", pnpTest("bbf52535-3a7e-452b-b0eb-9940832163aa", async function  () {
            const sharePointSettings = await this.pnp.graph.admin.sharepoint.settings.update({ deletedUserPersonalSiteRetentionPeriodInDays: 30 });
            return expect(sharePointSettings.deletedUserPersonalSiteRetentionPeriodInDays === 30).is.true;
        }));
    });

    describe("People", function () {
        it("Get People Settings", pnpTest("9bd5a022-65d3-4a34-b8c4-c74381b98551", async function  () {
            const settings = await this.pnp.graph.admin.people();
            return expect(settings.profileCardProperties).to.be.an("array") && expect(settings).to.haveOwnProperty("id");
        }));

        it("Get Pronoun Settings", pnpTest("bbc0e5af-3620-4164-9120-556ac534db39", async function  () {
            const settings = await this.pnp.graph.admin.people.pronounSettings();
            return expect(settings.isEnabledInOrganization).to.be.an("boolean");
        }));

        it.skip("Update Pronoun Settings", pnpTest("830c2b41-5642-40d6-8585-3e26207e3f13", async function  () {
            const settings = await this.pnp.graph.admin.people.pronounSettings.update({
                isEnabledInOrganization: true,
            });
            return expect(settings.isEnabledInOrganization).is.true;
        }));

        it.skip("Add Profile Card Property", pnpTest("49b98899-0af3-4b8b-8f66-3748410420b7", async function  () {
            const property = await this.pnp.graph.admin.people.profileCardProperties.add({
                directoryPropertyName: "CustomAttribute2",
                annotations: [{
                    displayName: "Cost Center",
                    localizations: [
                        {
                            languageTag: "ru-RU",
                            displayName: "центр затрат",
                        },
                    ],
                }],
            });
            return expect(property.id).is.not.null;
        }));

        it("Get Profile Card Property", pnpTest("05d8f50a-1b47-4631-9576-2aa3c5efcf75", async function  () {
            const property = await this.pnp.graph.admin.people.profileCardProperties.getById(customUserProperty)();
            return expect(property.id).is.not.null;
        }));

        it("Update Profile Card Property", pnpTest("04fb914e-41c6-4b8e-a326-63c41e6672a4", async function  () {
            const displayName = getRandomString(5) + "Cost Center";
            const property = await this.pnp.graph.admin.people.profileCardProperties.getById(customUserProperty).update({
                directoryPropertyName: this.customUserProperty,
                annotations: [{
                    displayName: getRandomString(5) + "Cost Center",
                    localizations: [
                        {
                            languageTag: "ru-RU",
                            displayName: "центр затрат",
                        },
                    ],
                }],
            });
            return expect(property.annotations[0]?.displayName).equals(displayName);
        }));

        it("Delete Profile Card Property", pnpTest("fbfae956-d776-4bd7-8ad2-3db384ec02c3", async function  () {
            const property = await this.pnp.graph.admin.people.profileCardProperties.add({
                directoryPropertyName: getRandomString(5) + "CustomAttribute2",
                annotations: [{
                    displayName: "Cost Center",
                    localizations: [
                        {
                            languageTag: "ru-RU",
                            displayName: "центр затрат",
                        },
                    ],
                }],
            });
            const response = await this.pnp.graph.admin.people.profileCardProperties.getById(property.id).delete();
            return expect(response).is.ok;
        }));
    });

    after(async function  () {

        if (!stringIsNullOrEmpty(propertyId)) {
            try {

                await this.pnp.graph.admin.people.profileCardProperties.getById(propertyId).delete();

            } catch (err) {
                console.error(`Cannot clean up test property: ${propertyId}`);
            }
        }
        return;
    });
});
