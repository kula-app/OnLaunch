import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import Moment from "moment";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { MdClose, MdDeleteForever } from "react-icons/md";
import getMessage from "../../../../../../../api/messages/getMessage";
import updateMessage from "../../../../../../../api/messages/updateMessage";
import { Action } from "../../../../../../../models/action";
import { Message } from "../../../../../../../models/message";
import Routes from "../../../../../../../routes/routes";
import styles from "../../../../../../../styles/Home.module.css";

export default function EditMessageOfAppPage() {
  const router = useRouter();
  const toast = useToast();

  const actionTypes = ["DISMISS"];
  const buttonDesigns = ["FILLED", "TEXT"];

  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [actions, setActions] = useState<Action[]>([]);

  const [blocking, setBlocking] = useState(false);
  const messageId = Number(router.query.messageId);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const fetchMessageData = async () => {
      try {
        fillForm(await getMessage(orgId, appId, messageId));
      } catch (error) {
        toast({
          title: "Error while fetching message!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    };

    fetchMessageData();
  }, [router.isReady, orgId, appId, messageId, toast]);

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let message: Message = {
      id: messageId,
      title: title,
      body: body,
      blocking: blocking,
      startDate: String(new Date(startDate)),
      endDate: String(new Date(endDate)),
      appId: appId,
      actions: actions,
    };

    try {
      await updateMessage(orgId, appId, messageId, message);

      toast({
        title: "Success",
        description: "Message has been updated.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      navigateToAppMessagesPage();
    } catch (error) {
      toast({
        title: "Error while editing message!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function navigateToAppMessagesPage() {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }

  function fillForm(msg: Message) {
    // fill the form
    setTitle(msg.title);
    setBody(msg.body);
    setBlocking(msg.blocking);
    setStartDate(Moment(msg.startDate).format("YYYY-MM-DDTHH:mm:ss"));
    setEndDate(Moment(msg.endDate).format("YYYY-MM-DDTHH:mm:ss"));
    if (msg.actions) {
      setActions(msg.actions);
    }
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
          <div style={{ marginRight: "8%" }}>
            <form
              id="messageForm"
              onSubmit={submitHandler}
              className="shrink-0 flex flex-col justify-center items-center"
            >
              <div style={{ width: "400px" }}>
                <Heading className="text-center">Edit Message</Heading>
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
                <FormControl
                  display="flex"
                  alignItems="center"
                  className="mt-4"
                >
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
              </div>
              <div style={{ width: "655px" }}>
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
                            <Td>
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
                            </Td>
                            <Td>
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
                            </Td>
                            <Td>
                              <Input
                                type="text"
                                name="actionTitle"
                                value={action.title}
                                onChange={(event) =>
                                  handleActionTitleChange(index, event)
                                }
                              />
                            </Td>
                            <Td>
                              <IconButton
                                onClick={() => deleteAction(index)}
                                aria-label={""}
                              >
                                <MdDeleteForever />
                              </IconButton>
                            </Td>
                          </Tr>
                        );
                      })}
                  </Tbody>
                </Table>
                {actions.length == 0 && (
                  <p className="text-center mt-4 ">no actions added</p>
                )}
                <div className="mt-4 flex justify-center">
                  <Button colorScheme="blue" onClick={addAction}>
                    New Action
                  </Button>
                </div>
              </div>
              <Button
                style={{ width: 655 }}
                className="my-4"
                colorScheme="blue"
                type="submit"
              >
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
