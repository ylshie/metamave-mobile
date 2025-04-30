module.exports = {
    name: 'MetaMask',
    displayName: 'WeZan',
    plugins: [
        [
            'expo-build-properties',
            {
                android: {
                    extraMavenRepos: [
                        '../../node_modules/@notifee/react-native/android/libs'
                    ]
                },
                ios: {}
            }
        ],
        [
            '@config-plugins/detox',
            {
                subdomains: '*'
            }
        ]
    ]
};
