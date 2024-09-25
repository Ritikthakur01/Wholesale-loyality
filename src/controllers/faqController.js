import { FaqTitle , FaqQuesAns } from "../models/faq.js";
import { createError } from "../../utils/error";
import DateTime from "../../utils/constant/getDate&Time";

export const addFAQ = async(req, res, next) => {
    try {
        
        const { title  , QueAns} = req.body;

        if(!title || title == ""){
            return next(createError(403,"Please provide title"))
        }
        if(!QueAns | !Array.isArray(QueAns) || QueAns.length == 0){
            return next(createError(403,"Please provide Question and Answer list"))
        }

        const isFaqExist = await FaqTitle.findOne({
            where:{
                title:title
            },
            raw: true
        })

        if(isFaqExist){
            return next(createError(501,"This FAQ title already exists"))
        }

        const addTitle = await FaqTitle.create({
            title:title,
            updateByStaff: req.user.data.name,
            updatedIstAt: DateTime(),
            createdIstAt: DateTime()
        })

        const addAllQuestionsAnswers = await Promise.all(QueAns.map(async(QA)=>{

            return await FaqQuesAns.create({
                titleId : addTitle.id,
                question : QA.question,
                answer : QA.answer,
                updateByStaff: req.user.data.name,
                updatedIstAt: DateTime(),
                createdIstAt: DateTime()
            })
        })) 

        res.status(200).json({
            error: false,
            message: "FAQ create successfully",
            data: { 
                titleData: addTitle,
                QueAnsData: addAllQuestionsAnswers
             }
          });
    } catch (error) { 
        console.log("Add-FAQ Error ::>>",error);
        next(error);
    }
};


export const getFAQ = async(req, res, next) => {
    try {
        
        const { titleId } = req.query;

        if(!titleId || titleId == ""){
            return next(createError(403,"Please provide title id"))
        }

        const getTitle = await FaqTitle.findOne({
            where:{
                id: titleId
            }
        })

        if(!getTitle){
            return next(createError(400, "Title doesn't exist"))
        }

        const allQA = await FaqQuesAns.findAll({
            where:{
                titleId: titleId
            }
        })

        res.status(200).json({
            error: false,
            message: "FAQ fetched successfully",
            data: { 
                titleData: getTitle,
                QueAnsData: allQA
             }
          });
    } catch (error) { 
        console.log("get-FAQ Error ::>>",error);
        next(error);
    }
};

export const getAllTitles = async(req, res, next) => {
    try {

        const getTitle = await FaqTitle.findAll()

        if(!getTitle || getTitle.length == 0){
            return next(createError(400, "No Title exists"))
        }

        res.status(200).json({
            error: false,
            message: "Titles fetched successfully",
            data: getTitle
          });
    } catch (error) { 
        console.log("Titles fetched Error ::>>",error);
        next(error);
    }
};

export const deleteFAQ = async(req, res, next) => {
    try {
        
        const { titleId } = req.body;

        if(!titleId || titleId == ""){
            return next(createError(403,"Please provide title id"))
        }

        const deleteTitle = await FaqTitle.destroy({
            where:{
                id: titleId
            }
        })

        if(!deleteTitle || deleteTitle == 0){
            return next(createError(400, "Title doesn't exist"))
        }

        res.status(200).json({
            error: false,
            message: "FAQ delete successfully",
            
          });
    } catch (error) { 
        console.log("delete-FAQ Error ::>>",error);
        next(error);
    }
};

export const deleteQuestion = async(req, res, next) => {
    try {

        const { QAId } = req.body;

        if(!QAId || QAId == ""){
            return next(createError(403,"Please provide QuesAns id"))
        }

        const deleteQuestion = await FaqQuesAns.destroy({
            where:{
                id: QAId
            }
        })

        if(!deleteQuestion || deleteQuestion == 0){
            return next(createError(400, "Question doesn't exist"))
        }

        res.status(200).json({
            error: false,
            message: "QuesAns delete successfully",
          });

    } catch (error) { 
        console.log("delete-QuesAns Error ::>>",error);
        next(error);
    }
};

export const updateFAQ = async(req, res, next) => {
    try {

        const { QAId , title , question , answer} = req.body;

            if(!QAId || QAId == ""){
                return next(createError(402, "Please provide QA id."))
            }

            if(!title || title == ""){
                return next(createError(402, "Please provide title."))
            }

            if(!question || question == ""){
                return next(createError(402, "Please provide Question."))
            }

            if(!answer || answer == ""){
                return next(createError(402, "Please provide Answer."))
            }
            
            const updateQA = await FaqQuesAns.update({
                question : question, 
                answer : answer,
                updateByStaff: req.user.data.name,
                updatedIstAt: DateTime()
            },{
                where:{
                    id : QAId
                }
            })

            if(!updateQA || updateQA == 0){
                return next(createError(402, "Questions Answers doesn't exist."))
            }

            const fetchtitle = await FaqQuesAns.findOne({
                where:{
                    id : QAId
                },
                raw: true
            })

            const updateTitle = await FaqTitle.update({
                title : title,
                updateByStaff: req.user.data.name,
                updatedIstAt: DateTime()
            },{
                where:{
                    id : fetchtitle.titleId
                }
            })

        res.status(200).json({
            error: false,
            message: "FAQ updated successfully",
          });

    } catch (error) { 
        console.log("update-FAQ Error ::>>",error);
        next(error);
    }
};

export const getQA = async(req, res, next) => {
    try {

        const { QAId } = req.body;

            if(!QAId || QAId == ""){
                return next(createError(402, "Please provide QA id."))
            }

            const fetchQA = await FaqQuesAns.findOne({
                where:{
                    id : QAId
                },
                raw: true
            })

            if(!fetchQA){
                return next(createError(403, "No data found with this QA Id"))
            }

            const fetchtitle = await FaqTitle.findOne({
                where:{
                    id : fetchQA.titleId
                },
                raw: true
            })

        const data = {
            titleId : fetchQA.titleId,
            title : fetchtitle.title,
            question : fetchQA.question,
            answer : fetchQA.answer
        }

        res.status(200).json({
            error: false,
            message: "QA fetched successfully",
            data : data
          });

    } catch (error) { 
        console.log("get-QA Error ::>>",error);
        next(error);
    }
};


// export const getFAQonLandingPage = async(req, res, next) => {
//     try {

//         const fetchtitle = await FaqTitle.findAll({
//             raw: true
//         })

//         if(!fetchtitle | fetchtitle.length == 0){
//             return  next(createError(503, 'There is no FAQ Data'))
//         }

//         console.log('fetchtitlefetchtitlefetchtitle',fetchtitle);

//         let getData = [];

//         const allQA = await Promise.all(fetchtitle.map(async(QA)=>{

            

//             const allQA =  await FaqQuesAns.findAll({
//                 where:{
//                     titleId : QA.id
//                 },
//                 attributes: ['question','answer'],
//                 raw: true
//             })
//             allQA.map((qa)=>{

//                 qa.title = QA.title
//                 getData.push(qa)

//             })
//         })) 
        

         
//         res.status(200).json({
//             error: false,
//             message: "QA fetched successfully",
//             data : getData
//           });

//     } catch (error) { 
//         console.log("get-QA Error ::>>",error);
//         next(error);
//     }
// };


// API endpoint handler to fetch FAQ data
export const getFAQonLandingPage = async (req, res, next) => {
    try {

        const fetchTitles = await FaqTitle.findAll({ raw: true });

        if (!fetchTitles || fetchTitles.length === 0) {
            return next(createError(503, 'There is no FAQ Data'));
        }

   
        let allFAQs = [];

        
        for (const title of fetchTitles) {

            const faqQuesAns = await FaqQuesAns.findAll({
                where: { titleId: title.id },
                attributes: ['titleId','question', 'answer'],
                raw: true
            });

            let FAQ = {
                title: title.title,
                QA : faqQuesAns
            }

            allFAQs.push(FAQ);
        }

        res.status(200).json({
            error: false,
            message: "FAQ data fetched successfully",
            data: allFAQs
        });


    } catch (error) {
        // If an error occurs, log it and forward to the error handling middleware
        console.error("Error fetching FAQ data:", error);
        next(error);
    }
};

export const swappingFaqSequence = async(req, res, next)=>{
    try {
        const { titleId, sequenceNo } = req.body;
        if(!titleId){
            return next(createError(403, "Enter the valid Faq Title Id ...!"));
        }
        if(!sequenceNo || sequenceNo<=0){
            return next(createError(403, "Enter the valid Sequence No ...!"));
        }
        const getFAQ = await FaqTitle.findOne({
            where:{
                id:titleId
            },
            raw:true
        });
        if(!getFAQ){
            return next(createError(403, 'FAQ not found...!'));
        }
        const lastSequence = await FaqTitle.findOne({
            attributes:['sequence'],
            order:[['sequence','desc']],
            limit:1,
            raw:true
        });
        if(lastSequence.sequence===1){
            return next(createError(403,'There is only one FAQ so it has to only be a sequence 1'));
        }
        if(lastSequence.sequence<sequenceNo){
            return next(createError(403, 'Sequence out of range for FAQ...!'));
        }
        if(lastSequence.sequence===sequenceNo){
            return next(createError(403, 'Sequence will be same for this FAQ...!'));
        }
        const findFAQWithSequence = await FaqTitle.findOne({
            where:{
                sequence:sequenceNo
            },
            raw:true
        });
        const updateFAQ = await FaqTitle.update(
            { sequence: sequenceNo },
            { where: { id: titleId } }
        );
        const updateFAQWithSequence = await FaqTitle.update(
            { sequence: getFAQ.sequence },
            { where: { id: findFAQWithSequence.id } }
        );
        if (updateFAQ[0] === 0 || updateFAQWithSequence[0] === 0) {
            return next(createError(500, 'Failed to update FAQ.'));
        }
        return res.status(200).json({
            error:false,
            message:"Sequence will be updated for your requested sequence for FAQ",
            data:updateFAQ[0] + updateFAQWithSequence[0]
        });
    } catch (error) {
        console.log("Swapping FAQ error ::>>",error);
        next(error);
    }
}