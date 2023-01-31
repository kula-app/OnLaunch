import { useRouter } from 'next/router';
import styles from '../../../../styles/Home.module.css';
import useSWR, { useSWRConfig } from 'swr';
import { useRef } from 'react';
import { useState, useEffect } from 'react';
import Moment from 'moment';
import Navbar from "../../../../components/Navbar";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';

const fetcher = (...args) => fetch(...args).then((res) => res.json())
const deleter = (...args) => fetch(...args).then((res) => res.json())

export default function MessagesOfAppPage() {
    const router = useRouter();

    const APPS_API_URL = '/api/frontend/v0.1/apps/';
    const MESSAGES_API_URL = '/api/frontend/v0.1/messages/';
    
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    // if not editMode, it's createMode
    const [editMode, setEditMode] = useState(false);
    const [switchValue, setSwitchValue] = useState(false);
    const [messageId, setMessageId] = useState(-1);
    const [messages, setMessages] = useState([]);
    const [appName, setAppName] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const { appId } = router.query;


    const titleInputRef = useRef();
    const bodyInputRef = useRef();
    const blockingInputRef = useRef();
    const startInputRef = useRef();
    const endInputRef = useRef();

    useEffect(()=>{
        if(!router.isReady) return;
    
        if (appId) {
            fetch(APPS_API_URL + appId)
            .then((res) => res.json())
            .then((data) => { setMessages(data.messages), setAppName(data.name) });
        }
    }, [router.isReady]);

    function deleteMessage(id) {
        fetch(MESSAGES_API_URL + id, {
            method: 'DELETE'
        });

        setMessages(messages.filter((message) => message.id !== id));
        
        setAlertMessage('Message successfully deleted!');
        setShowSuccessAlert(true);
    }

    function submitHandler(event) {
        event.preventDefault();

        // load data from form
        const message = {
            id: messageId,
            title: titleInputRef.current.value,
            body: bodyInputRef.current.value,
            blocking: switchValue,
            startDate: startInputRef.current.value,
            endDate: endInputRef.current.value,
            appId: Number(router.query.appId),
        }


        // make PUT http request
        if (editMode) {
            fetch(MESSAGES_API_URL + messageId, {
                method: 'PUT',
                body: JSON.stringify(message),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => response.json())
            
            var index = messages.findIndex(i => i.id === messageId);

            let messagesCopy = [...messages];
            messagesCopy[index] = message;
            setMessages(messagesCopy);
            setAlertMessage('Message successfully updated!');
            setShowSuccessAlert(true);
            resetForm();
        } 
        // make POST http request
        else {
            fetch(MESSAGES_API_URL, {
                method: 'POST',
                body: JSON.stringify(message),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((response) => response.json())

            setAlertMessage('Message successfully created!');
            setShowSuccessAlert(true);
            resetForm();
            setMessages([...messages, message]);

        }
    }
    function loadEditMessage(id) {
        setEditMode(true);
        setMessageId(id);

        const message = messages.find(i => i.id === id);

        // fill the form
        titleInputRef.current.value = message.title;
        bodyInputRef.current.value = message.body;
        blockingInputRef.current.value = message.blocking;
        setSwitchValue(message.blocking);
        startInputRef.current.value = Moment(message.startDate).format("YYYY-MM-DDTHH:mm:ss");
        endInputRef.current.value = Moment(message.endDate).format("YYYY-MM-DDTHH:mm:ss");
    }

    function resetForm() {
        document.getElementById("messageForm").reset();
        setSwitchValue(false);
    }

    return (
        <>
            <div>
				<Navbar />
                <main className={styles.main}>
                    <h1>{appName}</h1>
                    <Table sx={{ minWidth: 650, maxWidth: 1300 }} aria-label="simple table" className="messageTable">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Title</strong></TableCell>
                                <TableCell><strong>Body</strong></TableCell>
                                <TableCell><strong>Blocking</strong></TableCell>
                                <TableCell><strong>Start Date</strong></TableCell>
                                <TableCell><strong>End Date</strong></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                messages.map((message, index) => {
                                    return (
                                        <TableRow key={index} >
                                            <TableCell>
                                                {message.id}
                                            </TableCell>
                                            <TableCell>
                                                {message.title}
                                            </TableCell>
                                            <TableCell>
                                                {message.body}
                                            </TableCell>
                                            <TableCell>
                                                {String(message.blocking)}
                                            </TableCell>
                                            <TableCell>
                                                {Moment(message.startDate).format("DD.MM.YYYY HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>
                                                {Moment(message.endDate).format("DD.MM.YYYY HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="hiddenTableElement" >
                                                    <IconButton onClick={() => loadEditMessage(message.id)} >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton onClick={() => deleteMessage(message.id)} >
                                                        <DeleteForeverIcon />
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                    <div className="addButton" >
                        <Button variant="contained" onClick={() => {setEditMode(false), resetForm()}} >New Message</Button>
                    </div>
                    <h1>{editMode ? 'Edit Message' : 'Create New Message'}</h1>
                    <form id="messageForm" onSubmit={submitHandler} className="column" >
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" name="title" ref={titleInputRef} />
                            <label htmlFor="body">Body</label>
                            <textarea id="body" name="body" ref={bodyInputRef} rows='10' />
                            <label htmlFor="blocking">Blocking</label>
                            <Switch ref={blockingInputRef} checked={switchValue} onChange={() => setSwitchValue(!switchValue)}></Switch>
                            <label htmlFor="startDate">Start Date</label>
                            <input type="datetime-local" id="startDate" name="startDate" ref={startInputRef} />
                            <label htmlFor="endDate">End Date</label>
                            <input type="datetime-local" id="endDate" name="endDate" ref={endInputRef} />
                            <Button variant="contained" type="submit">{editMode ? 'update' : 'save'}</Button>
                    </form>
                    {showSuccessAlert && <Alert severity="success" action={
                        <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setShowSuccessAlert(false);
                        }}
                        >
                        <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }>{alertMessage}</Alert>}
                </main>
            </div>
        </>
    );
}