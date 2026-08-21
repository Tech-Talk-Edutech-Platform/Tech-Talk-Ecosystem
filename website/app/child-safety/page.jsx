import {
  Eye,
  Heart,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

import InformationPageLayout, {
  InformationCard,
} from "../../components/InformationPageLayout";

export const metadata = {
  title: "Child Safety | Tech Talk Hub",

  description:
    "Learn about Tech Talk Hub’s approach to creating safe, respectful and supportive online learning experiences for children.",
};

export default function ChildSafetyPage() {
  return (
    <InformationPageLayout
      badge="Child Safety & Wellbeing"
      title="A safer space for"
      highlightedText="young learners."
      description="Children learn best when they feel respected, supported and comfortable. Their wellbeing should guide every learning experience."
    >
      <div className="mb-8 rounded-2xl border border-pink-100 bg-pink-50 px-5 py-4 text-sm leading-7 text-[#172554]">
        If a learner, parent or team member has a safety
        concern, contact Tech Talk Hub as soon as possible.
      </div>

      <div className="space-y-6">
        <InformationCard
          icon={Heart}
          title="Our commitment to learners"
        >
          <p>
            Tech Talk Hub aims to provide an online learning
            environment where children feel encouraged,
            respected and able to participate confidently.
          </p>

          <p>
            Tutors and team members are expected to act
            professionally, use age-appropriate language and
            support each learner’s wellbeing.
          </p>
        </InformationCard>

        <InformationCard
          icon={Users}
          title="Parent and guardian involvement"
        >
          <p>
            Parents and guardians should be involved in
            registration, scheduling and important decisions
            about their child’s participation.
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              A parent or guardian should authorize the
              learner’s participation.
            </li>

            <li>
              Families should know when classes are scheduled
              and how sessions are delivered.
            </li>

            <li>
              Parents may raise questions about lesson
              content, communication or tutor conduct.
            </li>

            <li>
              Younger learners may need an adult nearby during
              online sessions.
            </li>
          </ul>
        </InformationCard>

        <InformationCard
          icon={Video}
          title="Online class safety"
        >
          <p>
            Classes should take place through approved online
            platforms or other arrangements communicated to
            the family.
          </p>

          <p>
            Tutors should keep interactions focused on the
            lesson and use learning activities appropriate to
            the learner’s age.
          </p>

          <p>
            Any recording, photography or public use of class
            material should be handled with appropriate
            permission.
          </p>
        </InformationCard>

        <InformationCard
          icon={MessageCircle}
          title="Appropriate communication"
        >
          <p>
            Communication about classes, scheduling and
            support should remain professional and
            transparent.
          </p>

          <p>
            Parents or guardians should be included in
            relevant communications where appropriate.
          </p>

          <p>
            Learners should not be asked to keep secrets from
            their parents, share unnecessary personal
            information or participate in conversations
            unrelated to their learning.
          </p>
        </InformationCard>

        <InformationCard
          icon={Lock}
          title="Privacy and personal information"
        >
          <p>
            Learner names, photos, contact details, projects
            and personal information should be handled with
            care.
          </p>

          <p>
            We avoid requesting personal information that is
            not relevant to a learner’s participation or
            wellbeing.
          </p>

          <p>
            Parent testimonials, learner images and project
            showcases should only be published with
            appropriate permission.
          </p>
        </InformationCard>

        <InformationCard
          icon={ShieldCheck}
          title="Respectful learning environment"
        >
          <p>
            Bullying, harassment, discriminatory behavior and
            inappropriate language are not acceptable.
          </p>

          <p>
            Tutors should encourage participation without
            embarrassing, threatening or pressuring a learner.
          </p>

          <p>
            Where a concern is reported, Tech Talk Hub may
            pause an interaction or class while the situation
            is reviewed.
          </p>
        </InformationCard>

        <InformationCard
          icon={Eye}
          title="What families can do"
        >
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Help your child attend classes from a suitable
              shared or supervised space.
            </li>

            <li>
              Remind them not to share passwords, private
              photographs or unnecessary personal details.
            </li>

            <li>
              Encourage them to tell you if an interaction
              makes them uncomfortable.
            </li>

            <li>
              Contact our team if something about a lesson or
              communication does not feel right.
            </li>
          </ul>
        </InformationCard>

        <InformationCard
          icon={Mail}
          title="Report a concern"
        >
          <p>
            If you have a concern about a learner’s safety,
            tutor conduct, inappropriate communication or
            privacy, please contact Tech Talk Hub directly.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="mailto:admin@techtalkhub.com"
              className="font-bold text-[#2947C7] transition hover:text-[#FF3F7F]"
            >
              admin@techtalkhub.com
            </a>

            <span className="hidden text-slate-300 sm:inline">
              •
            </span>

            <a
              href="tel:+254704494504"
              className="font-bold text-[#2947C7] transition hover:text-[#FF3F7F]"
            >
              +254 704 494 504
            </a>
          </div>
        </InformationCard>
      </div>
    </InformationPageLayout>
  );
}