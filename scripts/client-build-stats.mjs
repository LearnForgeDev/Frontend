import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default class ClientBuildStatsPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('ClientBuildStats', stats => {
      const report = stats.toJson({
        all: false, chunks: true, chunkModules: true, nestedModules: true, ids: true,
        chunkModulesSpace: Infinity, nestedModulesSpace: Infinity,
        groupModulesByPath: false, groupModulesByType: false, groupModulesByAttributes: false,
        groupModulesByCacheStatus: false, groupModulesByExtension: false, groupModulesByLayer: false,
      });
      writeFileSync(resolve(compiler.outputPath, 'client-stats.json'), JSON.stringify(report));
    });
  }
}
