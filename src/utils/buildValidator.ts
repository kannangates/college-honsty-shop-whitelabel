
import { buildTestUtility } from './buildTestUtility';

export class BuildValidator {
  static async validateBuild(): Promise<boolean> {
    try {
      console.log('🔍 Running comprehensive build validation...');
      
      const testResults = await buildTestUtility.runAllTests();
      
      const criticalFailures = testResults.critical.failed;
      const nonCriticalWarnings = testResults.nonCritical.warnings;
      
      console.log('📊 Build Test Results:');
      console.log(`✅ Critical Tests Passed: ${testResults.critical.passed}`);
      console.log(`❌ Critical Tests Failed: ${criticalFailures}`);
      console.log(`⚠️ Non-Critical Warnings: ${nonCriticalWarnings}`);
      
      if (criticalFailures > 0) {
        console.error('❌ Build validation failed due to critical test failures');
        return false;
      }
      
      console.log('✅ Build validation passed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Build validation encountered an error:', error);
      return false;
    }
  }
}

// Auto-run build validation
BuildValidator.validateBuild().then(success => {
  if (success) {
    console.log('🎉 All systems operational - build is ready for deployment');
  } else {
    console.error('🚨 Build validation failed - please review and fix issues');
  }
});
