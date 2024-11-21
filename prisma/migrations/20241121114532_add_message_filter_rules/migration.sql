-- CreateEnum
CREATE TYPE "MessageRuleGroupOperator" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "MessageRuleConditionComparator" AS ENUM ('EQUALS', 'IS_NOT_EQUAL', 'IS_GREATER_THAN', 'IS_GREATER_THAN_OR_EQUAL', 'IS_LESS_THAN', 'IS_LESS_THAN_OR_EQUAL', 'CONTAINS', 'DOES_NOT_CONTAIN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_NULL', 'IS_NOT_NULL', 'IS_TRUE', 'IS_FALSE', 'IS_AFTER', 'IS_BEFORE', 'IS_AFTER_OR_EQUAL', 'IS_BEFORE_OR_EQUAL', 'MATCHES_REGEX', 'DOES_NOT_MATCH_REGEX');

-- CreateTable
CREATE TABLE "MessageFilter" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ruleGroupId" INTEGER,
    "messageId" INTEGER,

    CONSTRAINT "MessageFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRuleGroup" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "operator" "MessageRuleGroupOperator" NOT NULL,
    "parentGroupId" INTEGER,

    CONSTRAINT "MessageRuleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRuleCondition" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemVariable" TEXT NOT NULL,
    "comparator" "MessageRuleConditionComparator" NOT NULL,
    "userVariable" TEXT,
    "parentGroupId" INTEGER NOT NULL,

    CONSTRAINT "MessageRuleCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageFilter_messageId_key" ON "MessageFilter"("messageId");

-- AddForeignKey
ALTER TABLE "MessageFilter" ADD CONSTRAINT "MessageFilter_ruleGroupId_fkey" FOREIGN KEY ("ruleGroupId") REFERENCES "MessageRuleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageFilter" ADD CONSTRAINT "MessageFilter_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRuleGroup" ADD CONSTRAINT "MessageRuleGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "MessageRuleGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRuleCondition" ADD CONSTRAINT "MessageRuleCondition_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "MessageRuleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
