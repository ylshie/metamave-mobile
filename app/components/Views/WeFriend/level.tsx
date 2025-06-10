import { ReactNode } from "react"
import { View } from "react-native"
import Text from '../../../component-library/components/Texts/Text';
import LinearGradient from "react-native-linear-gradient"

export const Level = ({colors, icon, title, subtitle, foot}: {colors: (string|number)[], icon: ReactNode, title: string, subtitle: string, foot: string}) => {
    const Frame = ({children}:{children: ReactNode}) => (
        <LinearGradient 
            colors={colors}
            style={{
            position: 'relative',
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            padding: 5,
            }}
        >
            <View style={{
            position: 'relative',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 5,
            padding: 10,
            }}>
            {children}
            </View>
        </LinearGradient>
    )
    const Title = ({text}:{text:string}) => (
        <Text style={{
            color: '#0C092A',
            fontSize: 16,
            fontWeight: '500',
        }}>{text}</Text>
    )
    const SubTitle = ({text}:{text:string}) => (
        <Text style={{
            flex: 1,
            color: '#858494',
            fontSize: 14,
            fontWeight: '400',
            flexWrap: 'wrap',
        }}>{text}</Text>
    )
    const Foot = ({text}:{text:string}) => (
        <Text style={{
            flex: 1,
            width: '82%',
            color: '#000000',
            fontSize: 14,
            fontWeight: '400',
            flexWrap: 'wrap',
        }}>{text}</Text>
    )
    const Line = () => (
        <View style={{
            width: '100%',
            height: 1,
            backgroundColor: '#ADAFB1',
        }}/>
    )
    const Label = () => (
        <Text style={{
            width: '18%',
            color: '#000000',
            fontSize: 14,
            fontWeight: '600',
        }}>權益</Text>
    )
    return  <Frame>
                <View style={{
                position: 'relative',
                width: '100%',
                flexDirection: 'row',
                }}>
                    <View style={{
                        width: '15%',
                    //justifyContent: 'center',
                    //  alignContent: 'center',
                    }}>
                        {icon}
                    </View>
                    <View style={{
                        position: 'relative',
                        width: '75%',
                        marginLeft: 20,
                        overflow: 'hidden',
                    }}>
                        <Title text={title}/>
                        <SubTitle text={subtitle}/>
                        <Line/>
                        <View style={{
                            width: '100%',
                            flexDirection: 'row',
                        }}>
                        <Label/>
                        <Foot text={foot}/>
                        </View>
                    </View>
                </View>
            </Frame>
  }
  