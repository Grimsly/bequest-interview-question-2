import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { decrypt, encrypt } from "./util/encryption";
import { random } from "node-forge";
import { toast, ToastContainer } from "react-toastify";
import { PasswordDialog } from "./dialogs/PasswordDialog";
import "react-toastify/dist/ReactToastify.css";
import { RevertDialog } from "./dialogs/RevertDialog";

const API_URL = "http://localhost:8080";

interface DataObject {
  data: string;
  pill: string;
}

interface CombinedDataObject extends DataObject {
  inputted_data: string;
}

enum DataActionTypes {
  SET_INPUT_DATA_STRING = "set_input_data_string",
  SET_DATA_STRING = "set_data_string",
  SET_DATA_OBJECT = "set_data_object",
  SET_DATA_PILL = "set_data_pill",
}

// Data action types
type SetInputDataStringAction = {
  type: DataActionTypes.SET_INPUT_DATA_STRING;
  payload: string;
};

type SetDataStringAction = {
  type: DataActionTypes.SET_DATA_STRING;
  payload: string;
};

type SetDataObjectAction = {
  type: DataActionTypes.SET_DATA_OBJECT;
  payload: DataObject;
};

type SetDataPillAction = {
  type: DataActionTypes.SET_DATA_PILL;
  payload: string;
};

/** Available actions for the data reducer */
type DataActions =
  | SetInputDataStringAction
  | SetDataStringAction
  | SetDataObjectAction
  | SetDataPillAction;

/**
 * Reducer function for the data
 * @param state Current state for the data
 * @param action Available actions for the reducer
 * @returns Updated data state depending on action taken
 */
function dataReducer(state: CombinedDataObject, action: DataActions) {
  switch (action.type) {
    case DataActionTypes.SET_INPUT_DATA_STRING:
      return {
        ...state,
        inputted_data: action.payload,
      };

    case DataActionTypes.SET_DATA_STRING:
      return {
        ...state,
        data: action.payload,
      };

    case DataActionTypes.SET_DATA_OBJECT:
      return {
        inputted_data: action.payload.data,
        data: action.payload.data,
        pill: action.payload.pill,
      };

    case DataActionTypes.SET_DATA_PILL:
      return {
        ...state,
        pill: action.payload,
      };

    default:
      return state;
  }
}

function App() {
  const [data, dispatch] = useReducer(dataReducer, {
    inputted_data: "",
    data: "",
    pill: "",
  });

  const [salt, setSalt] = useState<string>("");
  const [updateDataPasswordDialogOpen, setUpdateDataPasswordDialogOpen] =
    useState<boolean>(false);
  const [verifyDataPasswordDialogOpen, setVerifyDataPasswordDialogOpen] =
    useState<boolean>(false);
  const [revertDataDialogOpen, setRevertDataDialogOpen] =
    useState<boolean>(false);

  const revert_dialog_text = useRef<string>("");

  // Generate a random salt on every login or page render
  useEffect(() => {
    setSalt(random.getBytesSync(32).toString());
  }, []);

  /**
   * Fetch data from the API for data
   */
  const getData = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const response_data = await response.json();

      if (response_data) {
        toast.success("Data was successfully retrieved.", {
          theme: "colored",
        });
        dispatch({
          type: DataActionTypes.SET_DATA_OBJECT,
          payload: response_data,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("An issue occurred when attempting to grabbing your data.", {
        theme: "colored",
      });
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  /**
   * Update the data by sending it to the API to be saved
   * @param password Password to use to encrypt data
   */
  const updateData = useCallback(
    async (password: string) => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({
            data: data.inputted_data,
            pill: encrypt(password, salt, data.inputted_data),
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (response && response.status === 200) {
          toast.success("Data has been updated.", {
            theme: "colored",
          });
        }

        await getData();
      } catch (error) {
        console.error(error);
        toast.error(
          "An issue occurred that didn't allow us to update the data, please try again.",
          {
            theme: "colored",
          }
        );
      }
    },
    [data.inputted_data, getData, salt]
  );

  /**
   * Revert the data to a previous version
   */
  const revertData = useCallback(async () => {
    try {
      const response = await fetch(API_URL + "/revert");
      const response_data = await response.json();

      if (response.status === 404) {
        toast.error(response_data.message, {
          theme: "colored",
        });
        dispatch({
          type: DataActionTypes.SET_DATA_OBJECT,
          payload: response_data,
        });
      } else {
        dispatch({
          type: DataActionTypes.SET_DATA_OBJECT,
          payload: response_data,
        });
        toast.success("Data has been reverted.", {
          theme: "colored",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("An issue occurred when attempting to revert your data.", {
        theme: "colored",
      });
    }
  }, []);

  /**
   * Verify the data
   * @param password Password to use to verify data
   */
  const verifyData = useCallback(
    async (password: string) => {
      try {
        const decrypted_data = decrypt(password, data.pill);
        if (data.data === decrypted_data) {
          toast.success("Data is safe from tampering.", {
            theme: "colored",
          });
        } else {
          throw new Error("Data has been tampered.");
        }
      } catch (error) {
        // Error means that there is a possibility of data tampering,
        // so give the user the ability to revert their data
        if (error instanceof Error) {
          // Depending on the error message, set that as the title of the revert dialog
          revert_dialog_text.current = error.message;
          setRevertDataDialogOpen(true);
        }
      }
    },
    [data.data, data.pill]
  );

  /**
   * Tamper the data
   */
  const tamperData = () => {
    dispatch({
      type: DataActionTypes.SET_DATA_STRING,
      payload: "wrong data",
    });

    toast.info("Data has been manually tampered with.");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <PasswordDialog
        isOpen={updateDataPasswordDialogOpen}
        setIsOpen={setUpdateDataPasswordDialogOpen}
        confirmText="Update"
        onConfirmPress={updateData}
      />
      <PasswordDialog
        isOpen={verifyDataPasswordDialogOpen}
        setIsOpen={setVerifyDataPasswordDialogOpen}
        confirmText="Verify"
        onConfirmPress={verifyData}
      />
      <RevertDialog
        isOpen={revertDataDialogOpen}
        setIsOpen={setRevertDataDialogOpen}
        descriptionText={revert_dialog_text.current}
        onGetPress={getData}
        onRevertPress={revertData}
      />
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          position: "absolute",
          padding: 0,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "20px",
          fontSize: "30px",
        }}
      >
        <div>Saved Data</div>
        <input
          style={{ fontSize: "30px" }}
          type="text"
          value={data.inputted_data}
          onChange={(e) =>
            dispatch({
              type: DataActionTypes.SET_INPUT_DATA_STRING,
              payload: e.target.value,
            })
          }
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{ fontSize: "20px" }}
            onClick={() => setUpdateDataPasswordDialogOpen(true)}
          >
            Update Data
          </button>
          <button
            style={{ fontSize: "20px" }}
            onClick={() => setVerifyDataPasswordDialogOpen(true)}
            disabled={!data.data || !data.pill}
          >
            Verify Data
          </button>
          <button style={{ fontSize: "20px" }} onClick={tamperData}>
            Tamper Data
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
