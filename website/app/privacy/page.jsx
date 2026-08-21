import {
  Database,
  Eye,
  Lock,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";

import InformationPageLayout, {
  InformationCard,
} from "../../components/InformationPageLayout";

export const metadata = {
  title: "Privacy Policy | Tech Talk Hub",

  description:
    "Learn how Tech Talk Hub handles personal information from parents, guardians, learners and website visitors.",
};

export default function PrivacyPage() {
  return (
    <InformationPageLayout
      badge="Privacy & Data Protection"
      title="Your privacy"
      highlightedText="matters."
      description="This policy explains how Tech Talk Hub collects, uses and protects information shared by families and website visitors."
    >
      <div className="mb-8 rounded-2xl border border-purple-100 bg-white px-5 py-4 text-sm text-slate-600">
        This policy applies to the Tech Talk Hub website,
        learning services and communication channels.
      </div>

      <div className="space-y-6">
        <InformationCard
          icon={Database}
          title="Information we collect"
        >
          <p>
            We may collect information that parents,
            guardians, learners and other visitors provide
            when they contact us, book a class, register for
            a program or use our website.
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              Parent or guardian names, phone numbers and
              email addresses.
            </li>

            <li>
              Learner names, ages, grade levels and relevant
              learning preferences.
            </li>

            <li>
              Class schedules, attendance, assignments,
              projects and learning progress.
            </li>

            <li>
              Payment and order information needed to
              administer services or purchases.
            </li>

            <li>
              Messages or enquiries sent through our website,
              email, WhatsApp or other communication
              channels.
            </li>

            <li>
              Basic technical information associated with
              website use.
            </li>
          </ul>
        </InformationCard>

        <InformationCard
          icon={Eye}
          title="How we use information"
        >
          <p>
            We use personal information to provide and improve
            our learning services, communicate with families
            and operate our website.
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              Arrange trial classes and ongoing learning
              sessions.
            </li>

            <li>
              Recommend age-appropriate programs and learning
              pathways.
            </li>

            <li>
              Monitor learner progress and provide feedback to
              families.
            </li>

            <li>
              Respond to support requests and other enquiries.
            </li>

            <li>
              Manage payments, receipts, product orders and
              account administration.
            </li>

            <li>
              Improve our programs, resources and website
              experience.
            </li>
          </ul>
        </InformationCard>

        <InformationCard
          icon={Users}
          title="Children’s information"
        >
          <p>
            Our services are designed for children and
            teenagers, and we expect a parent or guardian to
            be involved in registration and important
            decisions about a learner’s participation.
          </p>

          <p>
            We request learner information only where it is
            relevant to providing age-appropriate classes,
            supporting progress or communicating with the
            learner’s family.
          </p>

          <p>
            Parents or guardians may contact us with questions
            about information associated with their child.
          </p>
        </InformationCard>

        <InformationCard
          icon={ShieldCheck}
          title="Sharing information"
        >
          <p>
            We may share limited information with tutors,
            administrative team members and service providers
            when it is necessary to deliver our programs or
            operate our services.
          </p>

          <p>
            Examples may include video meeting platforms,
            payment providers, communication services and
            website infrastructure providers.
          </p>

          <p>
            We do not publish learner photos, project details,
            parent testimonials or private communications
            without appropriate permission.
          </p>
        </InformationCard>

        <InformationCard
          icon={Lock}
          title="Security and retention"
        >
          <p>
            We use reasonable administrative and technical
            measures to limit unauthorized access to personal
            information.
          </p>

          <p>
            Information is retained only for as long as needed
            to provide services, maintain appropriate records,
            resolve issues or meet applicable obligations.
          </p>

          <p>
            No online service can guarantee absolute security.
            Please avoid sending sensitive information through
            channels that are not necessary for the service
            being requested.
          </p>
        </InformationCard>

        <InformationCard
          icon={Eye}
          title="Cookies and website activity"
        >
          <p>
            Our website may use cookies or similar
            technologies that support essential functionality,
            user sessions, website performance and service
            improvements.
          </p>

          <p>
            Browser settings may allow you to manage or remove
            certain cookies, although some website features
            may not function as expected if essential cookies
            are disabled.
          </p>
        </InformationCard>

        <InformationCard
          icon={Mail}
          title="Questions and requests"
        >
          <p>
            If you would like to ask about information held by
            Tech Talk Hub, update your contact details or
            raise a privacy concern, please contact our team.
          </p>

          <a
            href="mailto:admin@techtalkhub.com"
            className="inline-flex font-bold text-[#2947C7] transition hover:text-[#FF3F7F]"
          >
            admin@techtalkhub.com
          </a>
        </InformationCard>
      </div>
    </InformationPageLayout>
  );
}