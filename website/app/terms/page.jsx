import {
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";

import InformationPageLayout, {
  InformationCard,
} from "../../components/InformationPageLayout";

export const metadata = {
  title: "Terms & Conditions | Tech Talk Hub",

  description:
    "Review the terms governing participation in Tech Talk Hub coding classes, learning programs and related services.",
};

export default function TermsPage() {
  return (
    <InformationPageLayout
      badge="Terms & Conditions"
      title="Clear expectations for"
      highlightedText="every family."
      description="These terms outline the general expectations for using our website, booking classes and participating in Tech Talk Hub programs."
    >
      <div className="mb-8 rounded-2xl border border-purple-100 bg-white px-5 py-4 text-sm text-slate-600">
        By booking a class, enrolling in a program or using
        our services, you agree to the applicable terms
        communicated by Tech Talk Hub.
      </div>

      <div className="space-y-6">
        <InformationCard
          icon={BookOpen}
          title="Our learning services"
        >
          <p>
            Tech Talk Hub provides coding classes, learning
            resources and related educational services for
            children and teenagers.
          </p>

          <p>
            Program content, lesson structure, class duration
            and learning outcomes may vary depending on a
            learner’s age, experience and selected program.
          </p>

          <p>
            We aim to provide a supportive learning
            experience, but progress depends on attendance,
            participation, practice and individual learner
            circumstances.
          </p>
        </InformationCard>

        <InformationCard
          icon={Users}
          title="Parent and guardian responsibilities"
        >
          <p>
            A parent or guardian should provide accurate
            registration details and remain responsible for
            authorizing a child’s participation.
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              Provide accurate learner age and contact
              information.
            </li>

            <li>
              Help ensure the learner has access to a suitable
              device and internet connection.
            </li>

            <li>
              Support attendance and appropriate participation
              in scheduled classes.
            </li>

            <li>
              Communicate relevant concerns or changes that
              may affect the learner’s experience.
            </li>
          </ul>
        </InformationCard>

        <InformationCard
          icon={Calendar}
          title="Scheduling and attendance"
        >
          <p>
            Class schedules are agreed with families based on
            availability, program structure and tutor
            capacity.
          </p>

          <p>
            Requests to reschedule should be communicated as
            early as possible. Rescheduling arrangements,
            missed lessons and makeup sessions are subject to
            the applicable program terms communicated during
            enrollment.
          </p>

          <p>
            Tech Talk Hub may adjust class times, tutor
            assignments or delivery arrangements when
            reasonably necessary.
          </p>
        </InformationCard>

        <InformationCard
          icon={CreditCard}
          title="Fees and payments"
        >
          <p>
            Program fees, payment schedules and any available
            trial arrangements are communicated before or
            during enrollment.
          </p>

          <p>
            Continued access to paid learning services may
            depend on timely payment of the agreed fees.
          </p>

          <p>
            Any applicable cancellation, refund or credit
            arrangements will be handled according to the
            terms communicated for the relevant program or
            purchase.
          </p>
        </InformationCard>

        <InformationCard
          icon={ShieldCheck}
          title="Respectful participation"
        >
          <p>
            Learners, parents, tutors and team members are
            expected to communicate respectfully and support a
            safe learning environment.
          </p>

          <p>
            Harassment, inappropriate conduct, misuse of
            learning platforms or behavior that threatens
            another person’s safety may result in restricted
            access or removal from a program.
          </p>
        </InformationCard>

        <InformationCard
          icon={FileText}
          title="Learning materials and content"
        >
          <p>
            Course materials, teaching resources, website
            content and other materials provided by Tech Talk
            Hub should be used for their intended educational
            purposes.
          </p>

          <p>
            Materials may not be copied, resold, redistributed
            or represented as another organization’s work
            without permission.
          </p>

          <p>
            Learner projects remain associated with the
            learner. Any public sharing of a child’s work
            should be discussed with the relevant parent or
            guardian.
          </p>
        </InformationCard>

        <InformationCard
          icon={Mail}
          title="Questions about these terms"
        >
          <p>
            If you have questions about enrollment, payments,
            scheduling or any part of our services, contact
            us before making a commitment.
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