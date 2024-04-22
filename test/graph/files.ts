import { expect } from "chai";
import * as path from "path";
import * as fs from "fs";
import findupSync from "findup-sync";
import "@pnp/graph/users";
import "@pnp/graph/files";
import { getRandomString, stringIsNullOrEmpty } from "@pnp/core";
import { IDriveItemAdd, IDriveItemAddFolder, IFileUploadOptions, IItemOptions } from "@pnp/graph/files";

// give ourselves a single reference to the projectRoot
const projectRoot = path.resolve(path.dirname(findupSync("package.json")));

describe("Drive", function () {
    let testUserName = "";
    let driveId = null;
    const fileOptions: IFileUploadOptions = {
        content: "This is some test content",
        filePathName: "pnpTest.txt",
        contentType: "text/plain;charset=utf-8",
    };

    const testConvert = path.join(projectRoot, "test/graph/assets", "testconvert.docx");

    // Ensure we have the data to test against
    before(async function () {

        if (!this.pnp.settings.enableWebTests || stringIsNullOrEmpty(this.pnp.settings.testUser)) {
            this.skip();
        }

        // Get a sample user
        try {
            testUserName = this.pnp.settings.testUser.substring(this.pnp.settings.testUser.lastIndexOf("|") + 1);
            const drives = await this.pnp.graph.users.getById(testUserName).drives();
            if (drives.length > 0) {
                driveId = drives[0].id;
            }
        } catch (err) {
            console.log("Could not retrieve user's drives");
        }
    });

    it("Get Default Drive", async function () {
        const drives = await this.pnp.graph.users.getById(testUserName).drives();
        return expect(drives.length).is.greaterThan(0);
    });

    it("Get Drive by ID", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const drive = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId)();
        return expect(drive).is.not.null;
    });

    it("Get Drive List", async function () {
        if (stringIsNullOrEmpty(this.pnp.settings.graph.id)) {
            this.skip();
        }
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const list = await this.pnp.graph.sites.getById(this.pnp.settings.graph.id).drive.list();
        return expect(list).is.not.null;
    });

    it("Get Recent Drive Items", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const recent = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).recent();
        return expect(recent).is.not.null;
    });

    it("Get Drive Root Folder", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const root = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root();
        return expect(root.id).length.greaterThan(0);
    });

    it("Get Drive Root Folder Children", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.children();
        return expect(children).is.not.null;
    });

    it("Add Drive Root Folder Item (Upload)", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `TestFile_${getRandomString(4)}.json`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        if (children != null) {
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(children.id).length.greaterThan(0);
    });

    it("Add Drive Root Folder Item (Add)", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `TestFile_${getRandomString(4)}.json`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const driveItemAdd: IDriveItemAdd = {
            filename: testFileName,
            content: fileOptions.content,
            contentType: fileOptions.contentType,
        };
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.children.add(driveItemAdd);
        if (children != null) {
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(children.id).length.greaterThan(0);
    });

    it("Add New Drive Folder", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFolderName = `TestFolder_${getRandomString(4)}`;
        const driveItemAdd: IDriveItemAddFolder = {
            name: testFolderName,
        };
        const folder = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.children.addFolder(driveItemAdd);
        if (folder != null) {
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(folder.id).delete();
        }
        return expect(folder.id).length.greaterThan(0);
    });

    it("Search Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const searchString = `TestFile_${getRandomString(4)}`;
        const testFileName = `${searchString}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let searchResults;
        if (children != null) {
            searchResults = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.search(searchString)();
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(searchResults).to.not.be.null;
    });

    it("Get Drive Item By ID", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let driveItemId;
        if (children != null) {
            driveItemId = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id)();
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(driveItemId.id).to.be.eq(children.id);
    });

    it("Get Drive Item By Path", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let driveItemId;
        if (children != null) {
            driveItemId = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemByPath(testFileName)();
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(driveItemId.id).to.be.eq(children.id);
    });

    // This tests takes too long for folder to be created to test getItemsByPath
    it.skip("Get Drive Items By Path", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        let driveItems;
        const testFolderName = `TestFolder_${getRandomString(4)}`;
        const folder = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.children.addFolder({ name: testFolderName });
        if (folder != null) {
            const testFileName = `${getRandomString(4)}.txt`;
            const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(folder.id)
                .upload({ filePathName: testFileName, content: "My File Content String" });
            if (children != null) {
                driveItems = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemsByPath(testFolderName)();
                // Clean up test file
                await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
            }
            // Clean up test folder
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(driveItems.length).to.be.gt(0);
    });

    it("Get Drive Delta", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const delta = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.delta()();

        return expect(delta).haveOwnProperty("values");
    });

    it("Get Drive Thumbnails", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const thumbnails = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.thumbnails();
        return expect(thumbnails).is.not.null;
    });

    // This logs to the console when it passes, ignore those messages
    it("Delete Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let driveItemId = null;
        if (children != null) {
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
            try {
                driveItemId = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id)();
            } catch (err) {
                // Do nothing as this is the expected outcome
            }
        }
        return expect(driveItemId).to.be.null;
    });

    // This logs to the console when it passes, ignore those messages
    it("Permanently Delete Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let driveItemId = null;
        if (children != null) {
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).permanentDelete();
            try {
                driveItemId = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id)();
            } catch (err) {
                // Do nothing as this is the expected outcome
            }
        }
        return expect(driveItemId).to.be.null;
    });

    it("Update Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const testFileName2 = `${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let driveItemUpdate;
        if (children != null) {
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).update({ name: testFileName2 });
            driveItemUpdate = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id)();
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(driveItemUpdate.name).to.eq(testFileName2);
    });

    it("Copy Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const testFileName2 = `${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let fileCopy: string = null;
        if (children != null) {
            const r = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root();
            const copyOptions: IItemOptions = {
                parentReference: { driveId: r.parentReference.driveId, id: r.id },
                name: testFileName2,
            };
            fileCopy = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).copyItem(copyOptions);
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
            if (fileCopy.length > 0) {
                await await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemByPath(testFileName2).delete();
            }
        }
        return expect(fileCopy).length.to.be.gt(0);
    });

    it("Move Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const testFileName2 = `${getRandomString(4)}.txt`;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.children.add({ filename: testFileName, content: "My File Content String" });
        let driveItemUpdate;
        if (children != null) {
            const testFolderName = `TestFolder_${getRandomString(4)}`;
            const folder = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.children.addFolder({ name: testFolderName });
            if (folder != null) {
                const moveOptions: IItemOptions = {
                    parentReference: { driveId: folder.parentReference.driveId, id: folder.id },
                    name: testFileName2,
                };
                driveItemUpdate = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).moveItem(moveOptions);
                // Clean up test file
                await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
                // Clean up test folder
                await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(folder.id).delete();
            } else {
                // Clean up test file
                await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
            }
        }
        return expect(driveItemUpdate.name).to.eq(testFileName2);
    });

    it("Convert Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `TestFile_${getRandomString(4)}.docx`;
        const testConvertFile: Uint8Array = new Uint8Array(fs.readFileSync(testConvert));
        const fo = {
            content: testConvertFile,
            filePathName: testFileName,
            contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let convertDriveItem = null;
        if (children != null) {
            convertDriveItem = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).convertContent("pdf");
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(convertDriveItem).is.not.null;
    });

    it("Get Drive Item Preview", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `TestFile_${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let previewDriveItem = null;
        if (children != null) {
            previewDriveItem = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).preview();
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(previewDriveItem).to.haveOwnProperty("getUrl");
    });

    // Seems graph is throwing 500 internal server errors, skipping for now
    it.skip("Follow Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let followDriveItem = null;
        if (children != null) {
            // Clean up test file
            followDriveItem = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).follow();
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(followDriveItem).to.be.null;
    });

    // Seems graph is throwing 500 internal server errors, skipping for now
    it.skip("UnFollow Drive Item", async function () {
        if (stringIsNullOrEmpty(driveId)) {
            this.skip();
        }
        const testFileName = `${getRandomString(4)}.txt`;
        const fo = JSON.parse(JSON.stringify(fileOptions));
        fo.filePathName = testFileName;
        const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.upload(fo);
        let unfollowDriveItem = null;
        if (children != null) {
            // Set up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).follow();
            try {
                await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).unfollow();
                unfollowDriveItem = true;
            } catch (err) {
                unfollowDriveItem = false;
            }
            // Clean up test file
            await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
        }
        return expect(unfollowDriveItem).to.be.true;
    });

    // it("Create Sharing Link", async function () {
    //     if (stringIsNullOrEmpty(driveId)) {
    //         this.skip();
    //     }
    //     const testFileName = `TestFile_${getRandomString(4)}.json`;
    //     const fo = JSON.parse(JSON.stringify(fileOptions));
    //     fo.filePathName = testFileName;
    //     const driveItemAdd: IDriveItemAdd = {
    //         filename: testFileName,
    //         content: fileOptions.content,
    //         contentType: fileOptions.contentType,
    //     };
    //     const children = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).root.children.add(driveItemAdd);
    //     let sharingLink = null;
    //     if (children != null) {
    //         // Create Sharing Link
    //         const sharingLinkInfo: ISharingLinkInfo = {
    //             type: "view",
    //             scope: "anonymous",
    //         };
    //         sharingLink = await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).createSharingLink(sharingLinkInfo);
    //         // Clean up test file
    //         await this.pnp.graph.users.getById(testUserName).drives.getById(driveId).getItemById(children.id).delete();
    //     }
    //     return expect(sharingLink).to.haveOwnProperty("id");
    // });

    /* Testing for Bundles is not possible as it is only supported in Personal OneDrive */
    // describe.skip("Bundles", function () {});
});

