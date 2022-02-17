import React, { useContext, useEffect, useReducer } from 'react';
import { auth, dbstore } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import moment from 'moment';
import {
	SET_LOADING,
	REGISTER_USER_SUCCESS,
	REGISTER_USER_ERROR,
	LOGOUT_USER,
	SET_USER,
	FETCH_JOBS_SUCCESS,
	FETCH_JOBS_ERROR,
	CREATE_JOB_SUCCESS,
	CREATE_JOB_ERROR,
	DELETE_JOB_ERROR,
	FETCH_SINGLE_JOB_SUCCESS,
	FETCH_SINGLE_JOB_ERROR,
	EDIT_JOB_SUCCESS,
	EDIT_JOB_ERROR,
} from './actions';
import reducer from './reducer';

const initialState = {
	user: null,
	uid: localStorage.getItem('uid'),
	isLoading: false,
	jobs: [],
	showAlert: false,
	editItem: null,
	singleJobError: false,
	editComplete: false,
	idToken: null
};
const AppContext = React.createContext();

const AppProvider = ({ children }) => {
	const [ state, dispatch ] = useReducer(reducer, initialState);

	const setLoading = () => {
		dispatch({ type: SET_LOADING });
	};

	// register
	const register = async (userInput) => {
		setLoading();
		try {
			const { user } = await auth.createUserWithEmailAndPassword(userInput.email, userInput.password);
			console.log('user: ', user);
			dispatch({ type: REGISTER_USER_SUCCESS, payload: { email: user.email, uid: user.uid } });

			localStorage.setItem('user', user.email);
		} catch (error) {
			dispatch({ type: REGISTER_USER_ERROR });
		}
	};

	// login
	const login = async (userInput) => {
		setLoading();
		try {
			const { user } = await auth.signInWithEmailAndPassword(userInput.email, userInput.password);
			localStorage.setItem('token', user.refreshToken);
			dispatch({ type: REGISTER_USER_SUCCESS, payload: { email: user.email, uid: user.uid } });
			localStorage.setItem('user', user.email);
		} catch (error) {
			dispatch({ type: REGISTER_USER_ERROR });
		}
	};

	// logout
	const logout = () => {
		localStorage.clear();
		dispatch({ type: LOGOUT_USER });
	};

	// fetch jobs
	const fetchJobs = async () => {
		setLoading();
		try {
			const docRef = doc(dbstore, 'users', state.uid);
			const docSnap = await getDoc(docRef);
			const data = docSnap.data();
			dispatch({ type: FETCH_JOBS_SUCCESS, payload: data.job });
		} catch (error) {
			dispatch({ type: FETCH_JOBS_ERROR });
		}
	}

	// create job
	const createJob = async (userInput) => {
		setLoading();
		try {
			const docRef = doc(dbstore, 'users', state.uid);
			const docGetSnap = await getDoc(docRef);
			const data = docGetSnap.data();
			let date = moment().format('lll');

			if (!docGetSnap._document) {
				await setDoc(docRef, {
					job: [ { ...userInput, createdAt: date, status: 'pending', id: new Date().getTime() } ]
				});
				dispatch({
					type: CREATE_JOB_SUCCESS,
					payload: [ { ...userInput, id: new Date().getTime(), createdAt: date, status: 'pending' } ]
				});
				return;
			} else {
				data.job.push({ ...userInput, id: new Date().getTime(), createdAt: date, status: 'pending' });

				await setDoc(docRef, { job: [ ...data.job ] });
				dispatch({ type: CREATE_JOB_SUCCESS, payload: data.job });
			}
		} catch (error) {
			console.log(error);
			dispatch({ type: CREATE_JOB_ERROR });
		}
	};
	const deleteJob = async (jobId) => {
		setLoading();
		try {
			const docRef = doc(dbstore, 'users', state.uid);
			const docGetSnap = await getDoc(docRef);
			const data = docGetSnap.data();

			const newData = data.job.filter((item) => item.id !== jobId);
			await setDoc(docRef, { job: newData });
			fetchJobs();
		} catch (error) {
			dispatch({ type: DELETE_JOB_ERROR });
		}
	};

	const fetchSingleJob = async (jobId) => {
		setLoading();
		try {
			const docRef = doc(dbstore, 'users', state.uid);
			const docGetSnap = await getDoc(docRef);
			const data = docGetSnap.data();

			const newData = data.job.filter((item) => item.id === parseInt(jobId));
			

			dispatch({ type: FETCH_SINGLE_JOB_SUCCESS, payload: newData[0] });
		} catch (error) {
			dispatch({ type: FETCH_SINGLE_JOB_ERROR });
		}
	}

	const editJob = async (jobId, userInput) => {
		setLoading();
		try {
			const docRef = doc(dbstore, 'users', state.uid);
			const docGetSnap = await getDoc(docRef);
			const data = docGetSnap.data();

			jobId = parseInt(jobId);
			const newData = data.job.map((item) => {
				if (item.id === jobId) {
					item.status = userInput.status;
					item.company = userInput.company;
					item.position = userInput.position;
				}
				return item;
			});

			await setDoc(docRef, { job: newData });
			dispatch({ type: EDIT_JOB_SUCCESS, payload: newData });
		} catch (error) {
			dispatch({ type: EDIT_JOB_ERROR });
		}
	};

	useEffect(() => {
		const user = localStorage.getItem('user');
		if (user) {
			dispatch({ type: SET_USER, payload: user });
		}
	}, []);
	return (
		<AppContext.Provider
			value={{
				...state,
				setLoading,
				register,
				login,
				logout,
				fetchJobs,
				createJob,
				deleteJob,
				fetchSingleJob,
				editJob
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
// make sure use
export const useGlobalContext = () => {
	return useContext(AppContext);
};

export { AppProvider };
