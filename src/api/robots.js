import axios from "axios";
import { backendApi } from "../utils/backendApi";

export const fetchRobotSummary = async (payload) => {
  const response = await axios.post(backendApi.robots,
    payload
  );
  return response.data;
};

export const fetchRobotOperations = async (payload, limit=50, offset=0) => {
  const formatLink = `${backendApi.robotoperations}?limit=${limit}&offset=${offset}`
  // const formatLink = `${backendApi.robotoperations}?all_data=true`

  const res = await axios.post(formatLink, payload);
  return res.data;
};
