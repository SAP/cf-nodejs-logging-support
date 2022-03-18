import { ConfigFile, ConfigField } from '../interfaces';

export class Config {

    private mergedConfig: ConfigField[] = [];
 
    constructor(...rest: ConfigFile[]) {
        this.addConfig(rest);
    }

    public getConfig(...fieldNames: string[]): ConfigField[] {

        if (fieldNames.length > 0) {
            let result: ConfigField[] = [];
            fieldNames.forEach(name => {
                let index = this.getIndex(name);
                let configField = this.mergedConfig[index];
                result.push(configField);
            });
            return result;
        }

        return this.mergedConfig;
    }

    public getCoreConfig(): ConfigField[] {
        const filtered = this.mergedConfig.filter(
            key => {
                return key.output?.includes('log');
            }
        );
        return filtered;
    }

    public getReqConfig(): ConfigField[] {
        const filtered = this.mergedConfig.filter(
            key => {
                return key.output?.includes("request-log")
            }
        );
        return filtered;
    }

    public getDeactivatedFields(): ConfigField[] {
        const filtered = this.mergedConfig.filter(
            key => {
                key.deactivated == true
            }
        );
        return filtered;
    }

    public addConfig(configs: ConfigFile[]) {

        configs.forEach(file => {
            file.config.forEach(field => {

                let index = this.getIndex(field.name);

                // if new config field
                if (index === -1) {
                    this.mergedConfig.push(field);
                    return;
                }

                // replace object in array with new field
                this.mergedConfig.splice(index, 1, field);

            })
        });
    }

    // get index of field in config
    private getIndex(name: string): number {

        let index = this.mergedConfig.findIndex(
            field => field.name == name
        );

        return index;
    }
}
