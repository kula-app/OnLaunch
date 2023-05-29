import Moment from "moment";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styles from "../../../../../../../styles/Home.module.css";
import { MdDeleteForever, MdClose } from "react-icons/md";
import { getSession } from "next-auth/react";
import Routes from "../../../../../../../routes/routes";
import { Action } from "../../../../../../../models/action";
import { Message } from "../../../../../../../models/message";
import getMessage from "../../../../../../../api/messages/getMessage";
import updateMessage from "../../../../../../../api/messages/updateMessage";
import {
  Button,
  FormControl,
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
  useToast,
} from "@chakra-ui/react";

export default function EditMessageOfAppPage() {
  const router = useRouter();
  const toast = useToast();

  const actionTypes = ["DISMISS"];
  const buttonDesigns = ["FILLED", "TEXT"];

  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [actions, setActions] = useState<Action[]>([]);

  const [switchValue, setSwitchValue] = useState(false);
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
      blocking: switchValue,
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
        status: "error",
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
    setSwitchValue(msg.blocking);
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
        <main className={styles.main}>
          <h1>Edit Message</h1>
          <form id="messageForm" onSubmit={submitHandler} className="column">
            <label>
              Title
              <Input
                required
                id="title"
                variant="outlined"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              Body
              <Textarea
                required
                id="body"
                className="marginTopMedium"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </label>
            <div>
              <FormControl display="flex" alignItems="center">
                <Switch
                  checked={switchValue}
                  onChange={() => setSwitchValue(!switchValue)}
                ></Switch>
              </FormControl>
            </div>
            <label>
              Start Date
              <Input
                type="datetime-local"
                id="startDate"
                className="marginTopMedium"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label>
              End Date
              <Input
                required
                type="datetime-local"
                id="endDate"
                className="marginTopMedium"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <h3 className="marginTopMedium centeredElement">Actions</h3>
            <Table
              sx={{ minWidth: 650, maxWidth: 1300 }}
              aria-label="simple table"
              className="messageTable"
            >
              <Thead>
                <Tr>
                  <Th>
                    <strong>Design</strong>
                  </Th>
                  <Th>
                    <strong>Type</strong>
                  </Th>
                  <Th>
                    <strong>Title</strong>
                  </Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {actions &&
                  actions.map((action: Action, index: number) => {
                    return (
                      <Tr key={index}>
                        <Th>
                          <label>
                            ButtonDesign
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
                          </label>
                        </Th>
                        <Th>
                          <label>
                            ActionType
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
                          </label>
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
                        <Th width="5%">
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
              <p className="marginTopSmall centeredElement">no actions added</p>
            )}
            <div className="addButton centeredElement">
              <Button
                onClick={() => {
                  addAction();
                }}
              >
                New Action
              </Button>
            </div>
            <Button type="submit">
              update
            </Button>
          </form>
        </main>
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
