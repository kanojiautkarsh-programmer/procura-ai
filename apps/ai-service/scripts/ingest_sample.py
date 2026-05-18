"""Ingest sample procurement policies for RAG testing."""
import sys
import os
import asyncio
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.modules.rag.service import ingest_document


SAMPLE_POLICIES = [
    {
        "content": """
Procurement Policy - Approval Thresholds

All procurement requests must follow these approval levels:
- Under $1,000: Direct manager approval
- $1,000 - $10,000: Department head approval
- $10,000 - $50,000: VP / Director approval
- $50,000 - $250,000: C-level approval
- Over $250,000: Board approval required

All contracts must be reviewed by legal before signing for amounts over $25,000.
        """,
        "source": "policy",
        "source_id": "approval_policy_v1",
    },
    {
        "content": """
Vendor Selection Policy

1. For purchases over $10,000, at least 3 competitive quotes must be obtained.
2. Preferred vendors list is maintained by Procurement team.
3. New vendors must complete due diligence questionnaire.
4. Vendor contracts over $50,000 require background check.
5. All vendors must sign data processing agreement if handling customer data.
        """,
        "source": "policy",
        "source_id": "vendor_policy_v1",
    },
    {
        "content": """
Software Subscription Management

1. All SaaS subscriptions must be registered in Procura AI within 7 days of purchase.
2. Quarterly license utilization review is mandatory.
3. Unused licenses must be reallocated or cancelled within 30 days.
4. Renewal negotiations should begin 60 days before expiry.
5. Duplicate tool detection runs monthly - overlapping tools must be consolidated.
6. Shadow IT detection: any unapproved subscription over $500/mo must be reviewed.
        """,
        "source": "policy",
        "source_id": "saas_policy_v1",
    },
]


async def main():
    org_id = os.getenv("ORG_ID", "org_demo")
    print(f"Ingesting {len(SAMPLE_POLICIES)} policies for org {org_id}...")

    for doc in SAMPLE_POLICIES:
        count = await ingest_document(
            content=doc["content"],
            source=doc["source"],
            source_id=doc["source_id"],
            organization_id=org_id,
            metadata={"title": doc["source_id"]},
        )
        print(f"  Ingested {doc['source_id']}: {count} chunks")

    print("Sample data ingestion complete!")


if __name__ == "__main__":
    asyncio.run(main())
