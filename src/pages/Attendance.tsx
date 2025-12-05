import PageBreadcrumb from "../components/common/PageBreadCrumb"; 
import PageMeta from "../components/common/PageMeta";
import UserMetaCardOnly from "../components/attendance/UserMetaCardOnly"; 
import AttendanceClock from "../components/attendance/AttendanceClock";
import AttendanceDataDisplay from "../components/attendance/AttendanceDisplay";
export default function Attendance() {
  return (
    <>
      <PageMeta
        title="Attendance"
        description="Attendance"
      />
      <PageBreadcrumb pageTitle="Attendance" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
       
        <div className="space-y-6">
          <UserMetaCardOnly /> 
          <AttendanceClock />
          <AttendanceDataDisplay />
        </div>
      </div>
    </>
  );
}
