import { getRandomString, stringIsNullOrEmpty } from "@pnp/core";
import { expect } from "chai";
import "@pnp/graph/admin";

describe("Admin", function () {
    const customUserProperty = "CustomAttribute1";
    let propertyId = "";
    // Ensure we have the data to test against
    before(async function () {

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

    it("People - Get SharePoint Settings", async function () {
        const sharePointSettings = await this.pnp.graph.admin.sharepoint.settings();
        return expect(sharePointSettings.availableManagedPathsForSiteCreation.length > 0).is.true;
    });

    it("People - Update SharePoint Settings", async function () {
        const sharePointSettings = await this.pnp.graph.admin.sharepoint.settings.update({ deletedUserPersonalSiteRetentionPeriodInDays: 30 });
        return expect(sharePointSettings.deletedUserPersonalSiteRetentionPeriodInDays === 30).is.true;
    });

    it("People - Get People Settings", async function () {
        const settings = await this.pnp.graph.admin.people();
        return expect(settings.profileCardProperties).to.be.an("array") && expect(settings).to.haveOwnProperty("id");
    });

    it("People - Get Pronoun Settings", async function () {
        const settings = await this.pnp.graph.admin.people.pronounSettings();
        return expect(settings.isEnabledInOrganization).to.be.an("boolean");
    });

    it.skip("People - Update Pronoun Settings", async function () {
        const settings = await this.pnp.graph.admin.people.pronounSettings.update({
            isEnabledInOrganization: true,
        });
        return expect(settings.isEnabledInOrganization).is.true;
    });

    it.skip("ProfileCard - Add Profile Card Property", async function () {
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
    });

    it("ProfileCard - Get Profile Card Property", async function () {
        const property = await this.pnp.graph.admin.people.profileCardProperties.getById(customUserProperty)();
        return expect(property.id).is.not.null;
    });

    it("ProfileCard - Update Profile Card Property", async function () {
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
    });
    it("ProfileCard - Delete Profile Card Property", async function () {
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
    });

    after(async function () {

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
