#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files that need URL updates (from the grep results)
const filesToUpdate = [
    'frontend/src/components/finances/finance_transactions/TransactionsList.js',
    'frontend/src/components/AgroTourism/FeedbackDash.js',
    'frontend/src/components/cropManagement_home/CropSummary/CropSummaryTiles/AgrochemicalTile.js',
    'frontend/src/components/finances/finance_home/home_transactions/ProfitInfoCard.js',
    'frontend/src/components/WholeSale_Management/ProductEditingForm.js',
    'frontend/src/components/insights_home/MarketPriceList.js',
    'frontend/src/components/cropManagement_home/CropInputComponents/EditCropInput.js',
    'frontend/src/components/finances/finance_salary/SalaryProcessingSection.js',
    'frontend/src/pages/inventory_pages/Inventory_records/ViewOneRecord.js',
    'frontend/src/pages/finance_pages/transactions/AddNewTransaction.js',
    'frontend/src/components/harvest/RecordList.js',
    'frontend/src/components/harvest/HarvestHome.js',
    'frontend/src/pages/employee_pages/emp_registation/ViewOneEmpDetails.js',
    'frontend/src/components/diseaseManagement_home/UpdateDisease.js',
    'frontend/src/components/WholeSale_Management/ProductAddingForm.js',
    'frontend/src/components/Employee/Employee_register/EmployeeList.js',
    'frontend/src/components/AgroTourism/AllBookings.js',
    'frontend/src/components/Inventory/Water/WaterTank.js',
    'frontend/src/pages/finance_pages/valuation/ViewValuationDetails.js',
    'frontend/src/components/WholeSale_Management/OrderHistory.js',
    'frontend/src/components/finances/finance_valuation/FinanceValuationStatBar.js',
    'frontend/src/components/Employee/Task_assign/EditTask.js',
    'frontend/src/components/Inventory/newBox.js',
    'frontend/src/pages/finance_pages/machine_hours/ViewMachineRecord.js',
    'frontend/src/components/AgroTourism/editBooking.js',
    'frontend/src/components/diseaseManagement_home/ViewDisease.js',
    'frontend/src/pages/finance_pages/income_records/FinanceIncome.js',
    'frontend/src/pages/inventory_pages/Eq and Machines/ViewOneMain.js',
    'frontend/src/components/Inventory/Inventory_records/EditInventoryRecords.js',
    'frontend/src/pages/crop_pages/Crop Input/ViewPlantingRecord.js',
    'frontend/src/components/WholeSale_Management/Payment.js',
    'frontend/src/components/WholeSale_Management/ConfirmTheOrders.js',
    'frontend/src/components/AgroTourism/BookingList.js',
    'frontend/src/components/diseaseManagement_home/DiseaseList.js',
    'frontend/src/components/Employee/Emp_Home/Emphome.js',
    'frontend/src/pages/finance_pages/valuation/AddValuation.js',
    'frontend/src/pages/finance_pages/transactions/DeleteTransaction.js',
    'frontend/src/components/finances/finance_home/FinanceHomeStatBar.js',
    'frontend/src/components/WholeSale_Management/ProductHistory.js',
    'frontend/src/pages/employee_pages/emp_attendance/ViewOneAttendance.js',
    'frontend/src/pages/finance_pages/transactions/ViewTransactionDetails.js',
    'frontend/src/components/Employee/Emp_attendance/GetEmpAttendance.js',
    'frontend/src/pages/finance_pages/valuation/EditValuation.js',
    'frontend/src/pages/finance_pages/machine_hours/AddNewMachineTask.js',
    'frontend/src/components/cropManagement_home/CropInputComponents/AddCropInputForm.js',
    'frontend/src/components/SideBar.js',
    'frontend/src/components/Employee/Employee_register/EditEmployee.js',
    'frontend/src/components/cropManagement_home/CropSummary/CropSummaryTiles/CropThreeTile.js',
    'frontend/src/pages/finance_pages/income_records/AddNewIncomeRecord.js',
    'frontend/src/components/Inventory/Eq and Machine/EditEqMain.js',
    'frontend/src/pages/finance_pages/valuation/Valuation.js',
    'frontend/src/components/cropManagement_home/RotationComponents/EditRotation.js',
    'frontend/src/components/Employee/Employee_register/EmpForm.js',
    'frontend/src/components/insights_home/AddPrice.js',
    'frontend/src/components/diseaseManagement_home/AddDisease.js',
    'frontend/src/pages/finance_pages/transactions/EditTransaction.js',
    'frontend/src/components/cropManagement_home/CropSummary/CropSummaryTiles/RotationTile.js',
    'frontend/src/components/WholeSale_Management/OrderPlacingForm.js',
    'frontend/src/components/finances/finance_transactions/FinanceTransactionsStatBar.js',
    'frontend/src/components/diseaseManagement_home/visualization/GenerateGraphs.js',
    'frontend/src/components/harvest/AddRecord.js',
    'frontend/src/components/cropManagement_home/CropSummary/CropSummaryTiles/CropTwoTile.js',
    'frontend/src/components/finances/finance_valuation/ValuationProjection.js',
    'frontend/src/components/WholeSale_Management/OrderEditingForm.js',
    'frontend/src/components/Inventory/Eq and Machine/AddEqMain.js',
    'frontend/src/components/Inventory/Inventory_records/InventoryRecordsList.js',
    'frontend/src/components/cropManagement_home/RotationComponents/RotationList.js',
    'frontend/src/components/finances/finance_home/home_transactions/TransactionsInfoCard.js',
    'frontend/src/pages/finance_pages/machine_hours/EditMachineRecord.js',
    'frontend/src/components/cropManagement_home/CropSummary/CropSummaryTiles/CropOneTile.js',
    'frontend/src/components/AgroTourism/FeedbackList.js',
    'frontend/src/components/Inventory/Inventory_records/AddInventoryRecords.js',
    'frontend/src/components/AgroTourism/Booking.js',
    'frontend/src/components/cropManagement_home/CropInputComponents/PlantingList.js',
    'frontend/src/components/Employee/Task_assign/TaskList.js',
    'frontend/src/components/Employee/Task_assign/TaskForm.js',
    'frontend/src/components/AgroTourism/editFeedback.js',
    'frontend/src/components/diseaseManagement_home/home/DiseaseHome.js',
    'frontend/src/components/cropManagement_home/RotationComponents/recordRotation.js',
    'frontend/src/components/cropManagement_home/CropInputComponents/ChemicalList.js',
    'frontend/src/components/finances/finance_machines/MachineRecordsList.js',
    'frontend/src/pages/crop_pages/Crop Input/ViewChemicalRecord.js',
    'frontend/src/components/harvest/Visualisation/HarvestGraphs.js',
    'frontend/src/components/Inventory/Eq and Machine/EqMaintain.js',
    'frontend/src/components/diseaseManagement_home/home/DiseaseHomeContent.js',
    'frontend/src/components/WholeSale_Management/WholeSaleProduct.js',
    'frontend/src/pages/employee_pages/task_assigning/ViewTaskDetails.js',
    'frontend/src/components/harvest/updateRecord.js',
    'frontend/src/components/finances/finance_salary/PastSalaryList.js',
    'frontend/src/pages/crop_pages/Rotation Management/ViewRotationRecord.js'
];

// Function to update a single file
function updateFile(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        if (!fs.existsSync(fullPath)) {
            console.log(`File not found: ${filePath}`);
            return false;
        }

        let content = fs.readFileSync(fullPath, 'utf8');
        let updated = false;

        // Replace hardcoded localhost URLs
        const localhostPattern = /http:\/\/localhost:5555/g;
        if (localhostPattern.test(content)) {
            content = content.replace(localhostPattern, '${process.env.REACT_APP_API_BASE_URL}');
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
            return true;
        } else {
            console.log(`No changes needed: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
        return false;
    }
}

// Update all files
console.log('Starting URL updates...');
let updatedCount = 0;

filesToUpdate.forEach(file => {
    if (updateFile(file)) {
        updatedCount++;
    }
});

console.log(`\nCompleted! Updated ${updatedCount} files.`);
