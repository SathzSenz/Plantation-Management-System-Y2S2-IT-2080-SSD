import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingAnimation from "./components/utility/LoadingAnimation";
import {KindeProvider} from "@kinde-oss/kinde-auth-react";
import { SpeedInsights } from "@vercel/speed-insights/react"

import LandingPage from "./pages/landingPage.js";
import SigninPage from "./pages/signinPage.js";
import Dashboard from "./pages/Dashboard.js";


import Finances from "./pages/finance_pages/Finances.js";
import FinanceIncome from "./pages/finance_pages/income_records/FinanceIncome";
import AddNewIncomeRecord from "./pages/finance_pages/income_records/AddNewIncomeRecord";

import AddNewTransaction from "./pages/finance_pages/transactions/AddNewTransaction";
import ViewAllTransactions from "./pages/finance_pages/transactions/ViewAllTransactions";
import ViewTransactionDetails from "./pages/finance_pages/transactions/ViewTransactionDetails";
import EditTransaction from "./pages/finance_pages/transactions/EditTransaction";
import DeleteTransaction from "./pages/finance_pages/transactions/DeleteTransaction";

import Valuation from "./pages/finance_pages/valuation/Valuation";
import AddNewValuation from "./pages/finance_pages/valuation/AddValuation";
import EditValuation from "./pages/finance_pages/valuation/EditValuation";
import ViewValuationDetails from "./pages/finance_pages/valuation/ViewValuationDetails";

import SalaryPayments from "./pages/finance_pages/salary_payments/SalaryPayments";
import ViewPastRecords from "./pages/finance_pages/salary_payments/ViewPastRecords";

import MachineHours from "./pages/finance_pages/machine_hours/MachineHours";
import AddNewMachineTask from "./pages/finance_pages/machine_hours/AddNewMachineTask";
import EditMachineRecord from "./pages/finance_pages/machine_hours/EditMachineRecord";
import ViewMachineRecord from "./pages/finance_pages/machine_hours/ViewMachineRecord";

import Settings from "./pages/settings/Settings";

import CropManagement from "./pages/crop_pages/CropManagement";
import CropRotation from "./pages/crop_pages/Rotation Management/CropRotation";
import AddRotationPage from "./pages/crop_pages/Rotation Management/AddRotationPage";
import ViewRotation from "./pages/crop_pages/Rotation Management/ViewRotation";
import UpdateRotation from "./pages/crop_pages/Rotation Management/UpdateRotation"
import AddCropInput from "./pages/crop_pages/Crop Input/AddCropInput";
import ViewPlantingPage from "./pages/crop_pages/Crop Input/ViewPlantingPage";
import ViewChemicalPage from "./pages/crop_pages/Crop Input/ViewChemicalPage";
import UpdateCropInputPage from "./pages/crop_pages/Crop Input/UpdateCropInputPage";
import ViewPlantingRecord from "./pages/crop_pages/Crop Input/ViewPlantingRecord";
import ViewRotationRecord from "./pages/crop_pages/Rotation Management/ViewRotationRecord";
import ViewChemicalRecord from "./pages/crop_pages/Crop Input/ViewChemicalRecord";

import MaintenanceLog from "./pages/inventory_pages/Eq and Machines/MaintenanceLog"
import AddEqMainPage from "./pages/inventory_pages/Eq and Machines/AddEqMainPage";
import EditEqMainPage from "./pages/inventory_pages/Eq and Machines/EditEqMainPage";
import Inventory from "./pages/inventory_pages/Inventory";
import Water from "./pages/inventory_pages/Water/Water";
import InventoryRecordList from "./pages/inventory_pages/Inventory_records/InventoryRecordListpage";
import AddInventoryRecordsPage from "./pages/inventory_pages/Inventory_records/AddInventoryRecordsPage";
import EditInventoryPage from"./pages/inventory_pages/Inventory_records/EditInventoryPage";
import ViewOneRecord from "./pages/inventory_pages/Inventory_records/ViewOneRecord";
import ViewOneMain from "./pages/inventory_pages/Eq and Machines/ViewOneMain";
import InSettingsPage from "./pages/inventory_pages/settings/InSettingsPage";

import DiseaseTracking from "./pages/diseaseTracking_pages/DiseaseTracking";
import ViewAllDiseases from "./pages/diseaseTracking_pages/records/ViewAllDiseases";
import DiseaseVisualization from "./pages/diseaseTracking_pages/visualization/diseaseVisualization";
import AddDiseaseRecord from "./pages/diseaseTracking_pages/records/AddDiseaseRecord";
import UpdateDiseaseRecord from "./pages/diseaseTracking_pages/records/UpdateDiseaseRecord";

import ViewDiseaseRecord from "./pages/diseaseTracking_pages/records/ViewDiseaseRecord";

import Insights from "./pages/insights/Insights";
import MarketPrice from "./pages/insights/marketPriceAnalysis/MarketPrice";

import WholeSaleTransaction from "./pages/WholeSaleMangement/WholeSaleCustomer/WholeSaleTransaction";
import MyOrders from "./pages/WholeSaleMangement/WholeSaleCustomer/MyOrders";
import AddingProduct from "./pages/WholeSaleMangement/OperationManager/AddingProduct";
import PlaceOrder from "./pages/WholeSaleMangement/WholeSaleCustomer/PlaceOrder";
import WholeSaleDashBoard from "./pages/WholeSaleMangement/OperationManager/WholeSaleDashBoard";
import EditProduct from "./pages/WholeSaleMangement/OperationManager/EditProduct";
import EditOrder from "./pages/WholeSaleMangement/WholeSaleCustomer/EditOrder";
import PaymentGateway from "./pages/WholeSaleMangement/WholeSaleCustomer/PaymentGateway";
import ConfirmOrders from "./pages/WholeSaleMangement/OperationManager/ConfirmOrders";

import Employee from "./pages/employee_pages/Employee.js";
import AddEmployee from "./pages/employee_pages/emp_registation/AddEmployee";
import AddTask from "./pages/employee_pages/task_assigning/AddTask";

import harvest from "./pages/harvest_pages/harvests";
import harvestCal from "./pages/harvest_pages/harvest_Cal/harvestCal";
import harvestRec from "./pages/harvest_pages/harvest_records/harvestRecords";

import AddRecord from "./components/harvest/AddRecord";
import EditHarvest from "./components/harvest/updateRecord";
import HarvestList from "./components/harvest/RecordList";

import AgroTourism from "./pages/tourism_pages/AgroTourismIntro";
import Feedback from "./pages/tourism_pages/FeedbackPage";
import BookingPg from "./pages/tourism_pages/BookingPg";
import PaymentPg from "./pages/tourism_pages/PaymentPg";
import ConfirmationPg from "./pages/tourism_pages/ConfirmationPg";
import FarmTourPg from "./pages/tourism_pages/FarmTours";
import FruitVegPicking from "./pages/tourism_pages/FruitVegPicking";
import FarmChore from "./pages/tourism_pages/FarmChore";
import EditBookingPg from "./pages/tourism_pages/EditBooking";
import FeedbackDisplay from "./pages/tourism_pages/ViewFeedback";
import FeedbackDashPg from "./pages/tourism_pages/FeedbackDashPg";
import EditFeedbackPg from "./pages/tourism_pages/EditFeedbackPg";

import ViewEmpDetails from "./pages/employee_pages/emp_registation/ViewEmpDetails";
import ViewTaskList from "./pages/employee_pages/task_assigning/ViewTaskList";

import EditEmployeePage from "./pages/employee_pages/emp_registation/EditEmployeePage";
import EditTask from "./components/Employee/Task_assign/EditTask";
import EditTaskPage from "./pages/employee_pages/task_assigning/EditTaskPage";

import ErrorPage from "./pages/ErrorPage";
import ViewOneEmpDetails from "./pages/employee_pages/emp_registation/ViewOneEmpDetails";
import ViewTaskDetails from "./pages/employee_pages/task_assigning/ViewTaskDetails";
import ViewAllAttendance from "./pages/employee_pages/emp_attendance/ViewAllAttendance";
import GetAttendance from "./pages/employee_pages/emp_attendance/GetAttendance";
import ViewOneAttendance from "./pages/employee_pages/emp_attendance/ViewOneAttendance";
import AllBookingsPg from "./pages/tourism_pages/AllBookingsPg";

export default function App() {
    const [loading, setLoading] = useState(true);

    // Simulate loading delay with useEffect
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 100); // Simulate 2 seconds loading time
        return () => clearTimeout(timer);
    }, []);


    return (
        <KindeProvider
            clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
            domain={process.env.REACT_APP_KINDE_DOMAIN}
            redirectUri={process.env.REACT_APP_KINDE_REDIRECT_URI}
            logoutUri={process.env.REACT_APP_KINDE_LOGOUT_URI}
            onRedirectCallback={(user, app_state) => {
                if (app_state?.redirectTo) {
                    window.location = app_state?.redirectTo;
                }
            }}
            isDangerouslyUseLocalStorage
        >
        <div className="App">
            {loading ? (
                <LoadingAnimation />
            ) : (
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<SigninPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />


                    <Route path="/finances/home" element={<Finances />} />
                    <Route path="/finances/financeincome" element={<FinanceIncome />} />
                    <Route path="/finances/financeincome/addnewrecord" element={<AddNewIncomeRecord />} />
                    <Route path="/finances/financeincome/viewrecord" element={<FinanceIncome />} />
                    <Route path="/finances/financeincome/updaterecord" element={<FinanceIncome />} />
                    <Route path="/finances/financeincome/deleterecord" element={<FinanceIncome />} />

                    <Route path="/finances/transactions" element={<ViewAllTransactions />} />
                    <Route path="/finances/transactions/addTransaction" element={<AddNewTransaction />} />
                    <Route path="/finances/transactions/viewTransactionDetails/:id" element={<ViewTransactionDetails />} />
                    <Route path="/finances/transactions/editTransaction/:id" element={<EditTransaction />} />
                    <Route path="/finances/transactions/deleteTransaction" element={<DeleteTransaction />} />

                    <Route path="/finances/salaryPayment" element={<SalaryPayments />} />
                    <Route path="/finances/salaryPayment/pastRecords" element={<ViewPastRecords />} />

                    <Route path="/finances/valuation" element={<Valuation />} />
                    <Route path="/finances/valuation/addValuation" element={<AddNewValuation/>} />
                    <Route path="/finances/valuation/editValuation/:id" element={<EditValuation />} />
                    <Route path="/finances/valuation/viewValuation/:id" element={<ViewValuationDetails />} />
                    <Route path="/finances/valuation/deleteValuation" element={<Valuation />} />

                    <Route path="/finances/machineHours" element={<MachineHours />} />
                    <Route path="/finances/machineHours/addMachineRecords" element={<AddNewMachineTask />} />
                    <Route path="/finances/machineHours/editMachineRecords/:id" element={<EditMachineRecord />} />
                    <Route path="/finances/machineHours/viewMachineRecords/:id" element={<ViewMachineRecord />} />

                    <Route path="/settings" element={Settings()}/>

                    <Route path="/tourism" element={AgroTourism()}/>
                    <Route path="/feedback" element={Feedback()}/>
                    <Route path="/booking" element={BookingPg()}/>
                    <Route path="/payment" element={PaymentPg()}/>
                    <Route path="/confirmation" element={ConfirmationPg()}/>
                    <Route path="/farmtour" element={FarmTourPg()}/>
                    <Route path="/fruitvegpick" element={FruitVegPicking()}/>
                    <Route path="/farmchore" element={FarmChore()}/>
                    <Route path="/booking/edit/:id" element={EditBookingPg()} />
                    <Route path="/feedbacklist" element={FeedbackDisplay()}/>
                    <Route path="/feedbackdash" element={FeedbackDashPg()}/>
                    <Route path="/feedback/:id" element={EditFeedbackPg()}/>
                    <Route path="/allBookings" element={AllBookingsPg()}/>

                    <Route path = "/crop/home" element={CropManagement()}/>
                    <Route path = "/crop/rotation/add" element={AddRotationPage()}/>
                    <Route path = "/crop/rotation" element={ViewRotation()}/>
                    <Route path = "/crop/rotation/update/:id" element={UpdateRotation()}/>
                    <Route path = "/crop/input/add" element={AddCropInput()}/>
                    <Route path = "/crop/input" element={ViewPlantingPage()}/>
                    <Route path = "/crop/input/planting/view" element={ViewPlantingPage()}/>
                    <Route path = "/crop/input/chemical/view" element={ViewChemicalPage()}/>
                    <Route path = "/crop/input/update/:id" element = {UpdateCropInputPage()}/>
                    <Route path ="/crop/rotation/record/:id" element={<ViewRotationRecord/>}/>
                    <Route path = "/crop/input/planting/record/:id" element = {<ViewPlantingRecord/>}/>
                    <Route path = "/crop/input/chemical/record/:id" element = {<ViewChemicalRecord/>}/>

                    <Route path= "/placeOrder" element={PlaceOrder()}/>
                    <Route path="/WholeSale/transactions/:id" element={<WholeSaleTransaction />}/>
                    <Route path="/WholeSale/orders" element={MyOrders()}/>
                    <Route path= "/placeOrder" element={PlaceOrder()}/>
                    <Route path="OperationManager/AddingProduct" element={AddingProduct()}/>
                    <Route path="/wholesaleDashboard" element={WholeSaleDashBoard()}/>
                    <Route path="/editProduct/:id" element={<EditProduct />}/>
                    <Route path="/editOrder/:id" element={<EditOrder />}/>
                    <Route path="wholesale/Payment" element={PaymentGateway()}/>
                    <Route path="/orders/confirm" element={ConfirmOrders()}/>


                    <Route path = "diseases/home" element={DiseaseTracking()}/>

                    <Route path = "/diseases/records/addDisease" element={AddDiseaseRecord()}/>
                    <Route path = "/diseases/records/updateDisease/:id" element={UpdateDiseaseRecord()}/>
                    <Route path = "/diseases/records/viewDisease/:id" element={ViewDiseaseRecord()}/>
                    <Route path = "/diseases/records" element={ViewAllDiseases()}/>
                    <Route path = "/diseases/visualization" element={DiseaseVisualization()}/>

                    <Route path= "/insights/home" element={Insights()}/>
                    <Route path= "/insights/marketprice" element={MarketPrice()}/>

                    <Route path= "/inventory/home" element={Inventory()}/>
                    <Route path= "/inventory/maintenancelog" element={MaintenanceLog()}/>
                    <Route path="/inventory/maintenancelog/addeqmainpage" element={(AddEqMainPage())}/>
                    <Route path="/inventory/maintenancelog/editeqmainpage/:id" element={<EditEqMainPage />} />
                    <Route path ="/inventory/maintenancelog/viewmain/:id" element={<ViewOneMain/>}/>
                    <Route path= "/inventory/water" element={Water()}/>
                    <Route path= "/inventory/inventoryrecords" element={InventoryRecordList()}/>
                    <Route path= "/inventory/inventoryrecords/addinventoryrecordspage" element={(AddInventoryRecordsPage())}/>
                    <Route path= "/inventory/inventoryrecords/editinventorypage/:id" element={<EditInventoryPage/>}/>
                    <Route path ="/inventory/inventoryrecords/viewRecord/:id" element={<ViewOneRecord/>}/>
                    <Route path= "/settings/inventory" element={InSettingsPage()}/>

                    <Route path= "/employees/home" element= {Employee()}/>
                    <Route path="/employees/registration/addEmployee" element={AddEmployee()}/>
                    <Route path="/employees/tasks/addTask" element={AddTask()}/>
                    <Route path="/employees/registration" element={ViewEmpDetails()}/>
                    <Route path="/employees/tasks" element={ViewTaskList()}/>
                    <Route path="/employees/registration/editEmployee/:id" element={<EditEmployeePage />}/>
                    <Route path ="/employees/tasks/editTasks/:id" element ={<EditTaskPage/>}/>
                    <Route path ="/employees/registration/viewEmployee/:id" element={<ViewOneEmpDetails/>}/>
                    <Route path ="/employees/tasks/viewTask/:id" element={<ViewTaskDetails/>}/>
                    <Route path= "/employees/attendance" element= {ViewAllAttendance()}/>
                    <Route path="/employees/attendance/getAttendance" element={GetAttendance()}/>
                    <Route path="/employees/attendance/viewAttendance/:id" element={<ViewOneAttendance/>}/>


                    <Route path="/harvest/home"  element={harvest()}/>
                    <Route path="/harvest/calculateHarvest"  element={harvestCal()}/>
                    <Route path="/harvest/harvestRecords"  element={harvestRec()}/>

                    <Route path="/harvest/records/addRecord" element={<AddRecord />} />
                    <Route path="/harvest/records/updateRecord/:id" element={<EditHarvest />} />
                    <Route path="/harvest/records" element={<HarvestList />} />

                    <Route path = "*" element={<ErrorPage/>} />c
                </Routes>
            )}
        </div>
            <SpeedInsights/>
        </KindeProvider>
    );
}