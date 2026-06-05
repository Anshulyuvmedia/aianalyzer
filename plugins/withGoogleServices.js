const { withProjectBuildGradle, withAppBuildGradle } = require("@expo/config-plugins");

function fixProjectBuildGradle(buildGradle) {
    let result = buildGradle;

    // No need to add google-services classpath - expo-notifications already does it

    // Bump AGP version to 8.9.1 for compileSdk 36 compatibility
    result = result.replace(
        /classpath\('com\.android\.tools\.build:gradle'\)/,
        "classpath('com.android.tools.build:gradle:8.9.1')"
    );

    // Add ext block for compileSdk/targetSdk if not present
    if (!result.includes("ext {")) {
        result = result.replace(
            "buildscript {",
            `buildscript {\n  ext {\n    compileSdkVersion = 36\n    targetSdkVersion = 36\n  }`
        );
    }

    return result;
}

function fixAppBuildGradle(appBuildGradle) {
    let result = appBuildGradle;

    // Add google-services plugin
    if (!result.includes("com.google.gms.google-services")) {
        result = result.replace(
            /apply plugin: "com\.facebook\.react"/,
            'apply plugin: "com.facebook.react"\napply plugin: "com.google.gms.google-services"'
        );
    }

    // Enable multi-dex for class loading
    if (!result.includes("multiDexEnabled")) {
        result = result.replace(
            /versionCode \d+/,
            "versionCode 1\n        multiDexEnabled true"
        );
    }

    // Add multidex dependency
    if (!result.includes("androidx.multidex:multidex")) {
        result = result.replace(
            /implementation\("com\.facebook\.react:react-android"\)/,
            'implementation("com.facebook.react:react-android")\n    implementation("androidx.multidex:multidex:2.0.1")'
        );
    }

    return result;
}

module.exports = function withGoogleServices(config) {
    config = withProjectBuildGradle(config, (cfg) => {
        cfg.modResults.contents = fixProjectBuildGradle(cfg.modResults.contents);
        return cfg;
    });
    config = withAppBuildGradle(config, (cfg) => {
        cfg.modResults.contents = fixAppBuildGradle(cfg.modResults.contents);
        return cfg;
    });
    return config;
};
