import { useEffect, useReducer, useState } from "react";
import { encrypt } from "./util/encryption";

const API_URL = "http://localhost:8080";

interface DataObject {
  data: string;
  pill: string;
}

enum DataActionTypes {
  SET_DATA_STRING = "set_data_string",
  SET_DATA_OBJECT = "set_data_object",
  SET_DATA_PILL = "set_data_pill",
}

// Data action types
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
  | SetDataStringAction
  | SetDataObjectAction
  | SetDataPillAction;

/**
 * Reducer function for the data
 * @param state Current state for the data
 * @param action Available actions for the reducer
 * @returns Updated data state depending on action taken
 */
function dataReducer(state: DataObject, action: DataActions) {
  switch (action.type) {
    case DataActionTypes.SET_DATA_STRING:
      return {
        ...state,
        data: action.payload,
      };

    case DataActionTypes.SET_DATA_OBJECT:
      return action.payload;

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
    data: "",
    pill: "",
  });

  const [password, setPassword] = useState<string>("password");
  const [salt, setSalt] = useState<string>("");
  const [iv, setIv] = useState<string>("");

  // If the app uses some sort of authentication service (e.g. AWS Cognito, Auth0, etc.),
  // there might be a salt or IV that could be set in the JWT of the user.
  // If using AWS, use the aws-amplify library and use Auth to retrieve the token and set the salt and IV here.
  useEffect(() => {
    setSalt("3f02Sy5lhgS2Depn9lrS1TQhkUkoq9HD");
    setIv("lKl5jsSHMEuaahxlRYqaz4UbY6377ORn");
  }, []);

  useEffect(() => {
    getData();
  }, []);

  /**
   * Fetch data from the API for data
   */
  const getData = async () => {
    const response = await fetch(API_URL);
    const response_data = await response.json();

    dispatch({
      type: DataActionTypes.SET_DATA_OBJECT,
      payload: response_data,
    });
  };

  /**
   * Update the data by sending it to the API to be saved
   */
  const updateData = async () => {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        data: data.data,
        pill: encrypt(password, iv, salt, data.data),
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    await getData();
  };

  /**
   * Verify the data
   */
  const verifyData = async () => {
    throw new Error("Not implemented");
  };

  return (
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
        value={data.data}
        onChange={(e) =>
          dispatch({
            type: DataActionTypes.SET_DATA_STRING,
            payload: e.target.value,
          })
        }
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
      </div>
    </div>
  );
}

export default App;
