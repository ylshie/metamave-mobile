import { ReactNode } from "react"
import { View } from "react-native"
import Text from '../../../component-library/components/Texts/Text';
import LinearGradient from "react-native-linear-gradient"

export const Step = ({step, state, title, foot}:{step: number, state: boolean[], title: string, foot: string}) => {
    const color = state[0]? '#738DED': '#949494'
    return <View style={{
      width: '100%',
      position: 'relative',
      flexDirection: 'row',
    }}>
      <View style={{
        width: '12%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '400',
          }}>{step}</Text>
        </View>
        {
            state[1]
            ?   <View style={{
                    position: 'relative',
                    width: 2,
                    flex: 1,
                }}/>
            :   <View style={{
                    position: 'relative',
                    width: 2,
                    flex: 1,
                    backgroundColor: color,
                }}/>
        }
      </View>
      <View>
        <Text style={{
          color: '#000000',
          fontSize: 16,
          fontWeight: '400',
        }}>{title}</Text>
        <Text style={{
          color: '#515151',
          fontSize: 14,
          fontWeight: '500',
        }}>{foot}</Text>
        <Text>&nbsp;</Text>
      </View>
    </View>
  }