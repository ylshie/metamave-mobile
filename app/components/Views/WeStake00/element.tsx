import { ColorValue, GestureResponderEvent, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../../../component-library/components/Texts/Text';
import CheckBox from '@react-native-community/checkbox';
import { ReactNode, useEffect, useState } from 'react';
import React from 'react';

export const Title = ({text}:{text:string}) => (
    <Text style={{
      width: '100%',
      color: '#000000',
      textAlign: 'left',
      fontSize: 15,
      fontWeight: '500',
    }}>{text}</Text>
)

export const Max = ({onPress}:{onPress?: ((event: GestureResponderEvent) => void) | undefined}) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#2343D6',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 0,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 12,
      }}>Max</Text>
    </TouchableOpacity>
  )
  export const Grid = ({children}:{children: ReactNode}) => {
    const list  = React.Children.toArray(children)
    return  <View style={{
              width: '100%',
              borderRadius: 10,
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: '#B8BEC3'
            }}>
              {list.map((value, index) => (
                ((index + 1) == list.length)
                  ? <View style={{
                      width: '100%',
                    }}>
                      {value}
                    </View>
                  : <View style={{
                      width: '100%',
                      borderBottomColor: '#B8BEC3',
                      borderBottomWidth: 1,
                      borderStyle: 'solid',
                    }}>
                      {value}
                    </View>
              ))}
            </View>
  }
  export const Row  = ({children}:{children: ReactNode}) => (
    <View style={{
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 10,
      paddingRight: 10,
      paddingVertical: 5,
    }}>
      {children}
    </View>
  )
  export const Balance = ({value, onPress}:{
                            value: number,
                            onPress?: ((event: GestureResponderEvent) => void) | undefined
                          }) => (
    <View style={{
      width: '100%',
      flexDirection: 'row',
      backgroundColor: '#D9DFE5',
      borderColor: '#B8BEC3',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
    }}>
      <Row>
        <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
          <Text style={{
            color: '#00000080',
            fontSize: 14,
            fontWeight: '400'
          }}>Balance:&nbsp;</Text>
          <Text style={{
            color: '#000000',
            fontSize: 14,
            fontWeight: '400'
          }}>{value}</Text>
        </View>
        <Max onPress={onPress}/>
      </Row>
    </View>
  )
  export const Key = ({text}:{text:string}) => (
                <Text style={{
                  color: '#00000080',
                  fontSize: 14,
                  fontWeight: '400',
                }}>{text}</Text>
              )
  export const Value = ({text}:{text:string}) => (
                <Text style={{
                  color: '#00000080',
                  fontSize: 14,
                  fontWeight: '400',
                }}>{text}</Text>
              )
  export const Stake = ({value, onChangeValue}:{
                          value: number,
                          onChangeValue?: ((text: number) => void) | undefined
                        }) => {
      const [stake, setStake] = useState(`${value}`)
      console.log('Stake', 'value=', value, 'stake=', stake)
      useEffect(()=>{
        const amount: number = parseInt(stake);
        if (onChangeValue && amount != value && !isNaN(amount)) {
          onChangeValue(amount)
        }
      }, [stake])
      useEffect(()=>{
        setStake(`${value}`)
      }, [value])
      return <View style={{
                          width: '100%',
                          backgroundColor: '#00000014',
                          borderColor: '#B8BEC3',
                          borderStyle: 'solid',
                          borderWidth: 1,
                          borderRadius: 10,
                        }}>
                            <View style={{
                                paddingLeft: 10,
                            }}>
                                <Text style={{
                                    color: '#00000080',
                                    fontSize: 12,
                                    fontWeight: '400'
                                }}>
                                    質押數量
                                </Text>
                            </View>
                            <Row>
                                <TextInput
                                  keyboardType='numeric'
                                  style={{
                                    color: '#000000',
                                    fontSize: 24,
                                    fontWeight: '400',
                                  }}
                                  value={stake}
                                  onChangeText={setStake}
                                />
                                <Text style={{
                                color: '#00000080',
                                fontSize: 24,
                                fontWeight: '400',
                                }}>wPoint</Text>
                            </Row>
                        </View>
  }
  
  export const Agreement = ({ checked, onPress }:
                            { 
                              checked: boolean
                              onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
                            }) => (
          <TouchableOpacity
            onPress={onPress}
            style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
            }
          }>
            <View pointerEvents="none">
                <CheckBox
                    value={checked} 
                    onPress={onPress}/>
            </View>
            <Text style={{
              color: '#000000',
              fontSize: 14,
              fontWeight: '400',
            }}>I agree to&nbsp;</Text>
            <Text style={{
              color: '#2343D6',
              fontSize: 14,
              fontWeight: '400',
            }}>terms & condition</Text>
          </TouchableOpacity>
        )
const Step = ({color, caption, onPress}: {
  color: ColorValue | undefined,
  caption: string,
  onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
}) => (
  <View style={{
    position: 'relative',
    width: '100%',
  }}>
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: 30,
        padding: 10,
        backgroundColor: color, //'#264C98'
      }}
    >
      <Text style={{
        width: '100%',
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
      }}>{caption}</Text>
    </TouchableOpacity>
  </View>
)
export const NextStep = ({caption, onPress}: {
  caption: string,
  onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
}) => (
  <Step color={'#264C98'} caption={caption} onPress={onPress}/>
)
export const BackStep = ({caption, onPress}: {
  caption: string,
  onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
}) => (
  <Step color={'#656565'} caption={caption} onPress={onPress}/>
)

