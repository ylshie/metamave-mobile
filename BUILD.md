Key Tool
cd android && ./gradlew signingReport
keytool -printcert -jarfile app-release.apk
keytool -list -v -keystore {my-app.keystore} -alias {my-app}

[iOS]
1. minminmun target
    [RESOLVED] change 13 => 14 
2. TARGET_IPHONE_SIMULATOR
    node_modules/expo-dev-menu/ios/DevMenuViewController.swift
    [TEMP] force true
    //let isSimulator = TARGET_IPHONE_SIMULATOR > 0
    #if targetEnvironment(simulator)
    let isSimulator = true
    #else
    let isSimulator = false
    #endif

General
0. Your lockfile needs to be updated, but yarn was run with `--frozen-lockfile`
    yarn install [package] => update lock file, need to avoid conflict package
    yarn setup

iOS Porting
0.  [sudo gem]
    echo password | sudo gem install bundler -v 2.5.8
1.  [add 3 framework]
    double-conversion.xcframework
    glog.xcframework
    OpenSSL.xcframework
2. [remove libFlipper.a]
    remove code that use libFlipper at iOS native
    remove libFlipper.a from Metamask's framework dependency
3.  [Remove react-native-flipper link]
    At ios/Pods/Target Support Files/Pods Metamask/Pods-MetaMask.release.xcconfig
    remove -l"react-native-flipper"