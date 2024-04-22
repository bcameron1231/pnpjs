import { TimelinePipe } from "@pnp/core";
import { BuildTimeline } from "../build-timeline.js";
import { globby } from "globby";
import { resolve } from "path";
import buildCopyFile from "../lib/copy-file.js";

/**
 * Copies files from the target's directory based on the supplied patterns to the same directory in the dist folder
 * @param source 'src' copies files from package src root to dist package root, 'built' copies files from built output to their relative to /packages path within the dist package root (esm/commonjs)
 * @param pattern glob patterns for files (see https://www.npmjs.com/package/globby)
 * @returns 
 */
export function CopyPackageFiles(source: "src" | "built", pattern: string[]): TimelinePipe {

    const stringPattern = JSON.stringify(pattern);

    return (instance: BuildTimeline) => {

        instance.on.package(async function (this: BuildTimeline) {

            this.context.targets.forEach(async (target) => {

                this.log(`Starting CopyPackageFiles with pattern ${stringPattern} on target '${target.tsconfigPath}'`, 1);

                const files = await target.packages.reduce((p, pkg) => {

                    const fileSourceRoot = resolve(source === "src" ? pkg.resolvedPkgSrcRoot : pkg.resolvedPkgOutRoot);
    
                    return p.then(async (a) => {
    
                        const temp = await (<any>globby)(pattern, {
                            cwd: fileSourceRoot,
                        });
    
                        // a.push(...temp.map(t => ({
                        //     src: resolve(fileSourceRoot, t),
                        //     dest: resolve(pkg.resolvedPkgDistRoot, source === "built" ? pkg.relativePkgDistModulePath : "", t),
                        // })));

                        a.push(...temp.map(t => ({
                            src: resolve(fileSourceRoot, t),
                            dest: resolve(pkg.resolvedPkgDistRoot, t),
                        })));
    
                        return a;
                    });
    
                }, Promise.resolve<{ src: string, dest: string }[]>([]));
    
                this.log(`CopyPackageFiles found ${files.length} files for pattern ${stringPattern} in target '${target.tsconfigPath}'`);

                for (let i = 0; i < files.length; i++) {
                    this.log(`CopyPackageFiles found ${files[i].src}`, 0);
                }

                await Promise.all(files.map(f => buildCopyFile(f.src, f.dest)));
                    
                this.log(`Completing CopyPackageFiles with pattern ${stringPattern} on target '${target.tsconfigPath}'`, 1);

            });            
        });

        return instance;
    }
}
