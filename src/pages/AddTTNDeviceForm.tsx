import React, { useState, Component} from "react";
import {
    BrowserRouter as Router,
    Route,
    Link,
    RouteComponentProps
  } from "react-router-dom";
import axios from 'axios' 


import { MainContentContainer, FormContainer } from '../styles/AddTTNDeviceForm.styles'  
import { Wrapper } from '../styles/ServerDisplay.styles'
import MainMenu from '../components/MainMenu'

import Box from '@mui/material/Box'
import Textfield from '@mui/material/TextField'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'



type TParams = { id: string };

const AddTTNDeviceForm = ({ match }: RouteComponentProps<TParams>) => {
    const [applicationId, setApplicationId] = useState("")
    const [deviceId, setDeviceId] = useState("")
    const [appEui, setAppEui] = useState("")
    const [devEui, setDevEui] = useState("")
    const [appKey, setAppKey] = useState("")
    const [type, setType] = useState("")
    const [format, setFormat] = useState("")

    const sendValue = () => {
        const data = {
            "TASK": "NEW_THING",
            "DATA": {
                "application_ID": applicationId,
                "device_ID": deviceId,
                "TTN_keys": {
                    "AppEUI": appEui,
                    "DevEUI": devEui,
                    "AppKey": appKey
                },
                "payload_function": {
                    "type": type,
                    "format": format,
                    "function_file": '*'
                },
                "lorawan_settings": {
                    "activation_method": "OTTA",
                    "lorawan_version": "1.0.3"
                }
            }
        }

        fetch('http://localhost:5002', {
            method: 'post',
            headers: 
                {
                    'Content-Type':'application/json', 
                    "Access-Control-Allow-Origin": "*"
                },
            body: JSON.stringify({
                 data: data
            })
         }).then((response) => console.log(response));
    }

    return (
        <Wrapper>
            <MainMenu/>
            <MainContentContainer>
                <FormContainer>
                    <div>
                        <Textfield
                            id="application-id"
                            label="Application ID"
                            variant="outlined"
                            value={applicationId}
                            onChange={(e:any) => setApplicationId(e.target.value)}
                        />
                        <Textfield
                            id="device-id"
                            label="Device ID"
                            variant="outlined"
                            value={deviceId}
                            onChange={(e:any) => setDeviceId(e.target.value)}
                        />
                    </div>
                    <div>
                        <Textfield
                            id="appeui"
                            label="App EUI"
                            variant="outlined"
                            value={appEui}
                            onChange={(e:any) => setAppEui(e.target.value)}
                        />
                        <Textfield
                            id="deveui"
                            label="Device EUI"
                            variant="outlined"
                            value={devEui}
                            onChange={(e:any) => setDevEui(e.target.value)}
                        />
                        <Textfield
                            id="appkey"
                            label="AppKey"
                            variant="outlined"
                            value={appKey}
                            onChange={(e:any) => setAppKey(e.target.value)}
                        />
                    </div>
                    <div>
                        <Textfield
                            id="type"
                            label="type"
                            variant="outlined"
                            value={type}
                            onChange={(e:any) => setType(e.target.value)}
                        />
                        <Textfield
                            id="format"
                            label="format"
                            variant="outlined"
                            value={format}
                            onChange={(e:any) => setFormat(e.target.value)}
                        />
                    </div>
                    <div>
                        <Button variant="outlined" startIcon={<AddIcon/>} onClick={sendValue}>
                            Add
                        </Button>
                    </div>
                </FormContainer>
            </MainContentContainer>
        </Wrapper>
    )
}


export default AddTTNDeviceForm