# How to execute playwright Tests.
    Find all page object files and all the playwright web tests in playwright folder. for configuraion like projects, headless mode,Environment specific urls,refer /config/playwrightConfig.json file.
    
    
    NOTE- before running playwright tests on edge browser, Please Install edge browser using the below command 

      npx playwright install msedge     

   
  # How to Generate Allure Report once the execution is complete
    Generate - allure generate allure-results --clean --output ./allure-report
    open -  allure open ./allure-report   




    
  



