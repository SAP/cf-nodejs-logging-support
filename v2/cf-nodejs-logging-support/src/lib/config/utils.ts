export function isEnvVarEnabled(envVar: string): boolean {
    const val = process.env[envVar];
    const isActivated = (val == "true" || val == "True" || val == "TRUE");
    if (isActivated) {
        return true;
    }
    return false;
}
