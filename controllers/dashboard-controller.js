


const getDashboardCounts = async (req, res) => {
  try {
   
  

    res.status(200).json({
      success: true,
      
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
                                                                                                                                                                                                                                                                                                                                                  
module.exports = {
  getDashboardCounts,
 
};
