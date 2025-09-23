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

iOS Porting
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