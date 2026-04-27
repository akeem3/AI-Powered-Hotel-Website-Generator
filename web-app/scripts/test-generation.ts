import { HomepageGenerationWorkflow } from '../app/langgraph/workflows/HomepageGenerationWorkflow';
import { HotelParameters } from '../app/langgraph/agents/schemas';

async function main() {
  const params: HotelParameters = {
    hotelName: "Grand Horizon Hotel",
    hotelType: "luxury",
    targetAudience: "business",
    brandPersonality: "elegant",
    location: "New York, NY"
  };

  const generationId = `test-${Date.now()}`;

  console.log('==================================================');
  console.log('🚀 Running Real Homepage Generation Workflow');
  console.log('==================================================');
  console.log(`ID: ${generationId}`);
  console.log(`Hotel: ${params.hotelName}`);
  console.log(`Type: ${params.hotelType}`);
  console.log(`Target: ${params.targetAudience}`);
  console.log(`Personality: ${params.brandPersonality}`);
  console.log(`Location: ${params.location}`);
  console.log('==================================================\n');

  try {
    const workflow = new HomepageGenerationWorkflow();
    console.log('Workflow created, starting invocation...\n');

    const result = await workflow.invoke({
      generationId,
      hotelParameters: params
    });

    console.log('\n==================================================');
    console.log('📊 GENERATION RESULT');
    console.log('==================================================');
    console.log(`Validation Status: ${result.validationStatus}`);
    console.log(`Quality Score: ${result.qualityScore}`);
    console.log(`Total Cost: $${result.totalCost?.toFixed(4) || 'N/A'}`);
    console.log(`Budget Exceeded: ${result.budgetExceeded}`);
    console.log(`Errors Count: ${(result.errors || []).length}`);
    console.log(`Validation Errors Count: ${(result.validationErrors || []).length}`);

    if (result.validationErrors && result.validationErrors.length > 0) {
      console.log('\n❌ Validation Errors:');
      result.validationErrors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

    if (result.assembledConfig) {
      console.log(`\n✅ Components Generated: ${result.assembledConfig.components?.length || 0}`);
      console.log('Component Types:', result.assembledConfig.components?.map((c: any) => c.type).join(', '));
    }

    if (result.validationStatus === 'pass') {
      console.log('\n✅ GENERATION SUCCESSFUL!');
    } else {
      console.log('\n❌ GENERATION FAILED!');
    }
    console.log('==================================================\n');

    // Save result to file
    const fs = await import('fs');
    const path = await import('path');
    const outputDir = path.join(process.cwd(), 'output');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `test-result-${generationId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`Result saved to: ${outputPath}`);

  } catch (error: any) {
    console.error('\n💥 FATAL ERROR:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Unhandled Error:');
  console.error(error);
  process.exit(1);
});
