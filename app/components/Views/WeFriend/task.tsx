import { ReactNode } from "react"
import { DimensionValue, View } from "react-native"
import Text from '../../../component-library/components/Texts/Text';
import LinearGradient from "react-native-linear-gradient"

const Progress = ({percent} : {percent: DimensionValue}) => {
    return  <LinearGradient
              colors={['#D9D9D9', '#FFFFFF']}
              style={{
                width:'100%',
                height: 20,
                borderRadius: 10,
            }}>
              <LinearGradient
                colors={['#FB9706', '#FFEFDA']}
                style={{
                  width: percent,
                  height: 20,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  width: '100%',
                  textAlign: 'right',
                  fontSize: 10,
                  fontWeight: '700',
                  lineHeight: 12,
                }}>{percent}&nbsp;&nbsp;</Text>
              </LinearGradient>
            </LinearGradient>
}
  
export const Task = ({icon, title, foot, percent}: {icon: ReactNode, title: string, foot: string, percent: DimensionValue}) => {
    const Frame = ({children}:{children: ReactNode}) => (
      <LinearGradient 
        colors={['#3068DB', '#1C3D82']}
        style={{
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 10,
          padding: 10,
        }}
      >
        {children}
      </LinearGradient>
    )
    const Title = ({text}:{text:string}) => (
      <Text style={{
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
      }}>{text}</Text>
    )
    const Foot = ({text}:{text:string}) => (
      <Text style={{
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '400',
      }}>{text}</Text>
    )
    return  <Frame>
              <View style={{
                width: '100%',
                flexDirection: 'row'
              }}>
                {icon}
                <View style={{
                  marginLeft: 10,
                }}>
                  <Title text={title}/>
                  <Foot text={foot}/>
                </View>
              </View>
              <Progress percent={percent}/>
            </Frame>
  }
