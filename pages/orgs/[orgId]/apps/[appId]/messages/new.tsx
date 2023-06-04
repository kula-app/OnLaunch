import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useState } from "react";
import styles from "../../../../../../styles/Home.module.css";

import { MdDeleteForever, MdClose } from "react-icons/md";
import { getSession } from "next-auth/react";
import createMessage from "../../../../../../api/messages/createMessage";
import Routes from "../../../../../../routes/routes";
import { Action } from "../../../../../../models/action";
import { Message } from "../../../../../../models/message";
import {
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Select,
  Switch,
  Table,
  Tbody,
  Textarea,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export default function NewMessageForAppPage() {
  const router = useRouter();
  const actionTypes = ["DISMISS"];
  const buttonDesigns = ["FILLED", "TEXT"];
  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [actions, setActions] = useState<Action[]>([]);
  const [blocking, setBlocking] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  function navigateToAppMessagesPage() {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }
  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // load data from form
    let message: Message = {
      title: title,
      body: body,
      blocking: blocking,
      startDate: startDate,
      endDate: endDate,
      appId: appId,
      actions: actions,
    };
    try {
      await createMessage(orgId, appId, message);
      setAlertMessage("Message created successfully!");
      setAlertSeverity("success");
      setShowAlert(true);
      resetForm();
      navigateToAppMessagesPage();
    } catch (error) {
      setAlertMessage(`Error while creating new message: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }
  function resetForm() {
    (document.getElementById("messageForm") as HTMLFormElement)?.reset();
    setBlocking(false);
  }
  function addAction() {
    setActions((oldActions) => [
      ...oldActions,
      { actionType: actionTypes[0], buttonDesign: buttonDesigns[0], title: "" },
    ]);
  }
  function deleteAction(index: number) {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  }
  function handleActionTitleChange(
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    let data = [...actions];
    data[index]["title"] = event.target.value;
    setActions(data);
  }

  function handleActionTypeChange(
    index: number,
    event: ChangeEvent<HTMLSelectElement>
  ) {
    let data = [...actions];
    data[index]["actionType"] = event.target.value as string;
    setActions(data);
  }

  function handleButtonDesignChange(
    index: number,
    event: ChangeEvent<HTMLSelectElement>
  ) {
    let data = [...actions];
    data[index]["buttonDesign"] = event.target.value as string;
    setActions(data);
  }
  return (
    <>
      <div>
        <div className="flex flex-row pt-8 px-8 justify-center">
          <div className="" style={{marginRight:"8%"}}>
            <form
              id="messageForm"
              onSubmit={submitHandler}
              className="shrink-0 flex flex-col"
              style={{width:"400px"}}
            >
              <h1 className="text-3xl font-bold text-center">New Message</h1>
              <FormControl isRequired className="mt-8">
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="Title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </FormControl>
              <FormControl isRequired className="mt-4">
                <FormLabel>Body</FormLabel>
                <Textarea
                  placeholder="Body"
                  value={body}
                  resize="none"
                  rows={6}
                  onChange={(event) => setBody(event.target.value)}
                />
              </FormControl>
              <FormControl display="flex" alignItems="center" className="mt-4">
                <FormLabel htmlFor="blocking-toggle" mb="0">
                  Blocking
                </FormLabel>
                <Switch
                  id="blocking-toggle"
                  isChecked={blocking}
                  onChange={() => setBlocking(!blocking)}
                />
              </FormControl>
              <FormControl className="mt-4">
                <FormLabel>Start Date</FormLabel>
                <Input
                  placeholder="Start Date"
                  type="datetime-local"
                  id="startDate"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </FormControl>
              <FormControl className="mt-4">
                <FormLabel>End Date</FormLabel>
                <Input
                  required
                  placeholder="End Date"
                  type="datetime-local"
                  id="endDate"
                  className="mt-8"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </FormControl>
              <h3 className="text-xl font-bold mt-4 text-center">Actions</h3>
              <Table aria-label="simple table" className="mt-4">
                <Thead>
                  <Tr>
                    <Th>Design</Th>
                    <Th>Type</Th>
                    <Th>Title</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {actions &&
                    actions.map((action: Action, index: number) => {
                      return (
                        <Tr key={index}>
                          <Th>
                            <Select
                              value={action.buttonDesign}
                              onChange={(event) =>
                                handleButtonDesignChange(index, event)
                              }
                            >
                              {buttonDesigns.map((value, index) => {
                                return (
                                  <option key={index} value={value}>
                                    {value}
                                  </option>
                                );
                              })}
                            </Select>
                          </Th>
                          <Th>
                            <Select
                              value={action.actionType}
                              onChange={(event) =>
                                handleActionTypeChange(index, event)
                              }
                            >
                              {actionTypes.map((value, index) => {
                                return (
                                  <option key={index} value={value}>
                                    {value}
                                  </option>
                                );
                              })}
                            </Select>
                          </Th>
                          <Th>
                            <Input
                              type="text"
                              name="actionTitle"
                              value={action.title}
                              onChange={(event) =>
                                handleActionTitleChange(index, event)
                              }
                            />
                          </Th>
                          <Th>
                            <IconButton
                              onClick={() => deleteAction(index)}
                              aria-label={""}
                            >
                              <MdDeleteForever />
                            </IconButton>
                          </Th>
                        </Tr>
                      );
                    })}
                </Tbody>
              </Table>
              {actions.length == 0 && (
                <p className="text-center mt-4 ">no actions added</p>
              )}
              <div className="mt-4 flex justify-center">
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    addAction();
                  }}
                >
                  New Action
                </Button>
              </div>
              <Button className="my-4" colorScheme="blue" type="submit">
                Save
              </Button>
            </form>
          </div>
          <div className="">
            <div className={styles.phoneContainer}>
              <div className={styles.phoneScreen}>
                <div>
                  <div className={styles.closeIconContainer}>
                    {!blocking && (
                      <MdClose
                        className={styles.closeIcon}
                        style={{ color: "grey" }}
                      ></MdClose>
                    )}
                  </div>
                  <h1 style={{ marginTop: blocking ? "72px" : "16px" }}>
                    {title}
                  </h1>
                </div>
                <div>
                  <p>{body}</p>
                </div>
                <div>
                  {actions &&
                    actions.map((action: Action, index: number) => {
                      if (action.buttonDesign === "FILLED") {
                        return (
                          <Button colorScheme="blue" key={index}>
                            {action.title}
                          </Button>
                        );
                      } else {
                        return (
                          <Button
                            colorScheme="blue"
                            variant="ghost"
                            key={index}
                          >
                            {action.title}
                          </Button>
                        );
                      }
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });
  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}