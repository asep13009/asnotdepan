import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import UserAccess from "../components/UserAccess/UserAccess";

export default function UserAccessPage() {
  return (
    <>
      <PageMeta
        title="User Access Management | TailAdmin - React.js Admin Dashboard Template"
        description="Manage user access and roles in the admin dashboard"
      />
      <PageBreadcrumb pageTitle="User Access" />
      <div className="space-y-6">
        <ComponentCard title="">
          <UserAccess />
        </ComponentCard>
      </div>
    </>
  );
}
